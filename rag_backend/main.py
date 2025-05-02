from fastapi import FastAPI, UploadFile, File, Form, HTTPException # Added HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from contextlib import asynccontextmanager
# --- Add Supabase imports ---
from supabase import create_client, Client
import traceback # For detailed error logging

from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

# --- Add dotenv import ---
from dotenv import load_dotenv

# --- Load environment variables from .env file ---
load_dotenv() # This will load variables from .env into os.environ

# --- Global Variables ---
# Paths to reference CSV files
CMMC_SCHEMA_PATH = "/Users/rajbehera/Downloads/docs/CMMCSchema.csv"
USERS_ROWS_PATH = "/Users/rajbehera/Downloads//docs/users_rows.csv"

# Global DataFrames for reference data
cmmc_schema_df = None
users_df = None

# --- Supabase Configuration (Reads VITE_ prefixed variables from environment) ---
# Use default values that indicate they weren't loaded, for clearer warnings
# Read the VITE_SUPABASE_URL and VITE_SUPABASE_KEY (service key) from the .env file
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "NOT_SET")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_KEY", "NOT_SET") # Use the service key
supabase: Client = None

# Function to load CSV safely
def load_csv(path, description):
    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            print(f"Successfully loaded {description} from {path}")
            return df
        except Exception as e:
            print(f"Error loading {description} CSV ({path}): {e}")
            return None
    else:
        print(f"Warning: {description} file not found at {path}")
        return None

# --- REMOVE In-memory store ---
# data_store = {}

# --- Model Loading Variables ---
# Load HF token from env if desired, otherwise use the hardcoded one
HF_TOKEN = os.environ.get("HF_TOKEN", "")
MODEL_NAME = "gpt2"
tokenizer = None
model = None
rag_pipeline = None

# --- Lifespan Management (Load models, reference data, and init Supabase client) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load reference data
    global cmmc_schema_df, users_df
    print("Loading reference data...")
    cmmc_schema_df = load_csv(CMMC_SCHEMA_PATH, "CMMC Schema")
    users_df = load_csv(USERS_ROWS_PATH, "Users Rows")
    print("Reference data loading complete.")

    # Load the model and pipeline on startup
    global tokenizer, model, rag_pipeline
    print("Loading model and tokenizer...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        rag_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
        print("Model and pipeline loaded successfully.")
    except Exception as e:
        print(f"Error loading model/pipeline: {e}")

    # --- Initialize Supabase client ---
    global supabase
    print("Initializing Supabase client...")
    try:
        # Check if the VITE_ prefixed variables were loaded correctly
        if SUPABASE_URL == "NOT_SET" or SUPABASE_KEY == "NOT_SET":
             print("Warning: VITE_SUPABASE_URL or VITE_SUPABASE_KEY not found in environment variables or .env file. Supabase integration will be disabled.")
        else:
             supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
             print("Supabase client initialized successfully.")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        # Optionally print URL to check if it looks correct (DO NOT print the key)
        print(f"Attempted to use Supabase URL: {SUPABASE_URL}")
    # --- End Supabase initialization ---

    yield
    # Clean up resources if needed on shutdown (optional)
    print("Shutting down...")

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan) # Use the lifespan manager

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

# Add a simple root endpoint for testing
@app.get("/")
async def read_root():
    return {"message": "RAG Backend is running!"}

# --- Modified Upload and Analyze Endpoint ---
@app.post("/upload_csv/") # Renamed for clarity, or keep /upload_csv/ if preferred
async def upload_csv(file: UploadFile = File(...), user_id: str = Form(...)):
    # This endpoint now handles upload, analysis, and storing results to Supabase.
    global cmmc_schema_df, users_df, rag_pipeline, supabase # Add supabase

    # --- Initial Checks ---
    if cmmc_schema_df is None:
        raise HTTPException(status_code=503, detail="CMMC schema data not loaded on server.")
    if rag_pipeline is None:
         raise HTTPException(status_code=503, detail="LLM Pipeline not available on server.")
    # --- Check if Supabase client is available ---
    if supabase is None:
         print("Warning: Supabase client not initialized. Results will not be stored.")
         # Decide if you want to raise an error or just proceed without storing
         # raise HTTPException(status_code=503, detail="Supabase connection not available.")

    findings_df = None
    try:
        # Read the uploaded file into a DataFrame
        # Keep a copy of the original file bytes in case stream is consumed
        file_content = await file.read()
        await file.seek(0) # Reset stream position if needed by pd.read_csv

        # Try reading with default comma delimiter
        try:
            findings_df = pd.read_csv(file.file)
        except pd.errors.ParserError:
            print("Failed reading CSV with comma delimiter, trying semicolon...")
            await file.seek(0) # Reset stream again
            try:
                 findings_df = pd.read_csv(file.file, delimiter=';')
            except Exception as e_delim:
                 print(f"Failed reading CSV with semicolon delimiter as well: {e_delim}")
                 raise HTTPException(status_code=400, detail="Failed to parse CSV file. Check delimiter (comma or semicolon) and format.")
        except Exception as e_read:
             print(f"Error reading CSV file: {e_read}")
             raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {e_read}")

        print(f"Successfully read uploaded file: {file.filename} for user_id: {user_id}")
        print(f"CSV Columns: {findings_df.columns.tolist()}") # Log columns for debugging

    except HTTPException as http_exc:
        raise http_exc # Re-raise specific HTTP exceptions
    except Exception as e:
        print(f"Error processing uploaded file for user_id {user_id}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {e}")
    finally:
        # Ensure the file stream is closed
        await file.close()

    # --- Start Analysis Logic ---
    try:
        results = {
            "summary": "Analysis pending.",
            "non_compliant_controls": [],
            "recommendations": []
        }

        # Define expected columns (adjust based on your actual CSVs)
        severity_column = 'finding.severity' # Adjust if your column name is different
        category_column = 'finding.category' # Example
        description_column = 'finding.description' # Example
        resource_name_column = 'resource.display_name' # Example
        resource_type_column = 'resource.type' # Example

        # Check for severity column existence
        if severity_column not in findings_df.columns:
             # Try alternative common names if needed
             alt_severity_column = 'Severity'
             if alt_severity_column in findings_df.columns:
                 severity_column = alt_severity_column
             else:
                 raise HTTPException(status_code=400, detail=f"Severity column ('{severity_column}' or similar) not found in uploaded findings. Found columns: {findings_df.columns.tolist()}")

        # Ensure severity column is string type before comparison
        findings_df[severity_column] = findings_df[severity_column].astype(str)
        high_severity_findings = findings_df[findings_df[severity_column].str.upper() == 'HIGH']

        identified_gaps_set = set()
        gap_to_findings_map = {}
        results["recommendations"] = []

        if not high_severity_findings.empty:
            control_id_column = 'Requirement ID'
            requirement_column = 'Requirement Statement'
            # Use the description_column defined earlier
            if description_column not in findings_df.columns:
                 # Handle missing description column if necessary
                 print(f"Warning: Description column '{description_column}' not found. Keyword matching might be affected.")
                 # Optionally, try an alternative or raise an error
                 # raise HTTPException(status_code=400, detail=f"Description column '{description_column}' not found.")

            stop_words = {
                "a", "an", "and", "are", "as", "at", "be", "but", "by",
                "for", "if", "in", "into", "is", "it", "no", "not", "of",
                "on", "or", "such", "that", "the", "their", "then", "there",
                "these", "they", "this", "to", "was", "will", "with", "you",
                "your", "all", "any", "has", "have", "from", "out", "use",
                "ensure", "implement", "provide", "define", "control", "system",
                "information", "security", "access", "organizational", "organization"
            }
            control_keywords = {}
            if cmmc_schema_df is not None and control_id_column in cmmc_schema_df.columns and requirement_column in cmmc_schema_df.columns:
                for _, control in cmmc_schema_df.iterrows():
                    control_id = control[control_id_column]
                    req_statement = str(control[requirement_column]).lower()
                    keywords = {
                        word.strip('.,:;()[]{}')
                        for word in req_statement.split()
                        if len(word.strip('.,:;()[]{}')) > 4 and word.strip('.,:;()[]{}') not in stop_words
                    }
                    control_keywords[control_id] = keywords
            else:
                print("Warning: CMMC Schema DF or required columns not available for keyword generation.")


            # Iterate through each high severity finding
            for finding_index, finding in high_severity_findings.iterrows():
                # Use .get() for safety in case description column is missing
                finding_desc = str(finding.get(description_column, '')).lower()
                if not finding_desc: continue

                for control_id, keywords in control_keywords.items():
                    matched_keyword = None
                    for keyword in keywords:
                         import re
                         # Use word boundaries to match whole words
                         if re.search(r'\b' + re.escape(keyword) + r'\b', finding_desc):
                             matched_keyword = keyword
                             break
                    if matched_keyword:
                        identified_gaps_set.add(control_id)
                        if control_id not in gap_to_findings_map:
                            gap_to_findings_map[control_id] = []
                        # Store the original DataFrame index
                        if finding_index not in gap_to_findings_map[control_id]:
                            gap_to_findings_map[control_id].append(finding_index)
            # --- End Keyword Matching ---

            results["non_compliant_controls"] = sorted(list(identified_gaps_set))

            # --- Generate Recommendations ---
            relevant_finding_columns = [
                 category_column, description_column,
                 resource_name_column, resource_type_column
            ]
            # Filter relevant_finding_columns to only include those present in the DataFrame
            relevant_finding_columns = [col for col in relevant_finding_columns if col in high_severity_findings.columns]
            print(f"--- Columns used for recommendation context: {relevant_finding_columns} ---") # Log relevant columns

            for control_id in results["non_compliant_controls"]:
                print(f"--- Generating recommendation for Control ID: {control_id} ---")
                # Ensure cmmc_schema_df and control_id_column are checked for existence
                if cmmc_schema_df is None or control_id_column not in cmmc_schema_df.columns:
                    print(f"Skipping recommendation for {control_id} due to missing CMMC schema data.")
                    results["recommendations"].append({"control_id": control_id, "recommendation": "Error: CMMC Schema data unavailable."})
                    continue

                control_info_rows = cmmc_schema_df[cmmc_schema_df[control_id_column] == control_id]
                if control_info_rows.empty:
                     print(f"Warning: Control ID {control_id} not found in CMMC Schema.")
                     results["recommendations"].append({"control_id": control_id, "recommendation": "Error: Control ID not found in CMMC Schema."})
                     continue
                control_info = control_info_rows.iloc[0]

                finding_context = "Multiple findings triggered this gap."
                if control_id in gap_to_findings_map and gap_to_findings_map[control_id]:
                    first_triggering_finding_index = gap_to_findings_map[control_id][0]
                    # Check if the index exists in the high_severity_findings DataFrame
                    if first_triggering_finding_index in high_severity_findings.index:
                        triggering_finding = high_severity_findings.loc[first_triggering_finding_index]
                        # Use .get() for safety when accessing finding columns
                        context_parts = []
                        for col in relevant_finding_columns:
                             # Ensure column exists before trying to get value
                             if col in triggering_finding.index:
                                 context_parts.append(f"{col}: {triggering_finding.get(col, 'N/A')}")
                             else:
                                 context_parts.append(f"{col}: [Column Not Found in Finding]")
                        finding_context = "\n".join(context_parts)

                    else:
                        finding_context = f"Finding data (index {first_triggering_finding_index}) not found in high severity findings."
                else:
                     finding_context = "No specific finding details linked to this gap." # Handle case where map is empty

                max_context_len = 1000 # Limit context length for the prompt
                if len(finding_context) > max_context_len: finding_context = finding_context[:max_context_len] + "..."

                # Ensure requirement_column exists before accessing
                req_statement_for_prompt = control_info.get(requirement_column, 'N/A')
                if req_statement_for_prompt == 'N/A':
                    print(f"Warning: Requirement statement not found for Control ID {control_id}")

                prompt = (
                    f"Context:\nCMMC Control Requirement ({control_info.get(control_id_column, 'N/A')}): {req_statement_for_prompt}\n" # Use .get() for safety
                    f"Related Finding Detail:\n{finding_context}\n\n"
                    f"Question: Based on the finding detail, provide a brief, actionable recommendation to meet the CMMC control requirement.\n\nRecommendation:"
                )
                recommendation_text = "Error: Recommendation generation failed." # Default error message
                try:
                    if rag_pipeline:
                         print(f"--- Calling RAG pipeline for {control_id} ---")
                         # Add truncation=True to prevent overly long inputs potentially causing issues
                         output = rag_pipeline(prompt, max_new_tokens=100, num_return_sequences=1, truncation=True)
                         print(f"--- RAG pipeline output for {control_id}: {output} ---") # Log raw output
                         if output and isinstance(output, list) and output[0] and 'generated_text' in output[0]:
                             # Attempt to isolate the recommendation text more robustly
                             full_text = output[0]['generated_text']
                             rec_marker = "Recommendation:"
                             rec_start_index = full_text.rfind(rec_marker) # Find the last occurrence
                             if rec_start_index != -1:
                                 recommendation_text = full_text[rec_start_index + len(rec_marker):].strip()
                                 if not recommendation_text: # Handle case where marker is present but text is empty
                                     recommendation_text = "Generated recommendation was empty."
                             else:
                                 # Fallback if marker not found - maybe model didn't follow format
                                 # Try to remove the prompt part if possible
                                 prompt_end_marker = "Recommendation:" # The end of the prompt itself
                                 prompt_end_index = prompt.rfind(prompt_end_marker)
                                 if prompt_end_index != -1:
                                      potential_answer = full_text[prompt_end_index + len(prompt_end_marker):].strip()
                                      if potential_answer:
                                          recommendation_text = potential_answer
                                      else:
                                          recommendation_text = "Failed to isolate recommendation from model output."
                                 else:
                                      recommendation_text = "Failed to isolate recommendation (marker not found)."

                         else:
                             recommendation_text = "Failed to generate recommendation (invalid output format)."
                             print(f"!!! Invalid RAG output format for {control_id}")
                    else:
                         recommendation_text = "Recommendation generation skipped: Pipeline not loaded."
                         print(f"!!! RAG pipeline not loaded, skipping recommendation for {control_id}")

                    results["recommendations"].append({"control_id": control_id, "recommendation": recommendation_text})
                    print(f"--- Generated recommendation for {control_id}: {recommendation_text[:100]}... ---")

                except Exception as e_inner:
                     print(f"!!! Error during RAG pipeline call or processing for {control_id}: {e_inner}")
                     traceback.print_exc() # Print traceback for detailed debugging
                     results["recommendations"].append({"control_id": control_id, "recommendation": f"Error generating recommendation: {e_inner}"})
            # --- End Recommendation Generation ---


        # Update summary message
        results["summary"] = f"Analyzed '{file.filename}'. Found {len(high_severity_findings)} high severity findings. Identified {len(results['non_compliant_controls'])} potential control gaps."
        print(f"--- Analysis Summary: {results['summary']} ---")

        # --- Store results in Supabase ---
        supabase_record_id = None
        if supabase: # Only proceed if Supabase client is initialized
            # 1. Insert the summary analysis record
            try:
                data_to_insert = {
                    "uploaded_filename": file.filename,
                    "user_id": user_id,
                    "analysis_summary": results["summary"],
                    "non_compliant_controls": results["non_compliant_controls"],
                    "recommendations": results["recommendations"]
                }
                print(f"Attempting to insert summary into Supabase table 'rag_analysis_results': {data_to_insert}")
                response = supabase.table("rag_analysis_results").insert(data_to_insert).execute()
                print(f"Supabase summary insert response: {response}")

                if response.data and len(response.data) > 0:
                    supabase_record_id = response.data[0].get('id')
                    print(f"Successfully stored analysis summary. Record ID: {supabase_record_id}")

                    # 2. Prepare and insert individual findings (if summary insert was successful)
                    if supabase_record_id:
                        individual_findings_data = []
                        # Define mapping from DataFrame columns (keys) to DB columns (values)
                        # Ensure these CSV column names EXACTLY match your input CSV
                        # Ensure these DB column names EXACTLY match your Supabase table 'individual_findings'
                        column_mapping = {
                            'finding.category': 'finding_category',
                            'finding.severity': 'finding_severity',
                            'finding.description': 'finding_description',
                            'resource.display_name': 'resource_display_name',
                            'resource.type': 'resource_type',
                            # Add other columns from your CSV that you want to store
                            # Example: 'vulnerability.cve.id': 'cve_id', # If these columns exist in CSV and DB
                        }
                        print(f"--- Preparing individual findings using mapping: {column_mapping} ---")
                        print(f"--- Available columns in uploaded CSV: {findings_df.columns.tolist()} ---")

                        # Iterate through the original findings DataFrame (all rows)
                        for index, row in findings_df.iterrows():
                            finding_record = {
                                "analysis_id": supabase_record_id, # Link to the summary record
                                "uploaded_filename": file.filename,
                                "user_id": user_id
                                # Add finding_id if you have a unique ID per finding in the CSV
                                # 'finding_id_from_csv': row.get('finding.id', None) # Example
                            }
                            # Map columns safely using .get() on the row Series
                            for csv_col, db_col in column_mapping.items():
                                # *** Check if the column exists in the DataFrame ***
                                if csv_col in findings_df.columns:
                                     value = row.get(csv_col)
                                     # Handle potential NaN values, convert to None (null in DB)
                                     if pd.isna(value):
                                         finding_record[db_col] = None
                                     else:
                                         # Ensure value is a basic type (str, int, float, bool)
                                         # This handles numpy types that Supabase might reject
                                         if hasattr(value, 'item'):
                                             finding_record[db_col] = value.item()
                                         elif isinstance(value, (str, int, float, bool)):
                                             finding_record[db_col] = value
                                         else:
                                             # Fallback: convert other types to string
                                             finding_record[db_col] = str(value)
                                else:
                                     # Log if a mapped column is missing in the CSV
                                     # print(f"--- Warning: Column '{csv_col}' not found in CSV for row {index}, skipping mapping to '{db_col}'. ---")
                                     # Optionally set the DB column to None or a placeholder if the column is mandatory in DB
                                     finding_record[db_col] = None # Set to NULL if missing

                            individual_findings_data.append(finding_record)

                        # Batch insert individual findings
                        if individual_findings_data:
                            print(f"--- Attempting to batch insert {len(individual_findings_data)} individual findings into Supabase table 'individual_findings' ---")
                            # print(f"--- Sample individual finding data: {individual_findings_data[0]} ---") # Log first record for debugging
                            response_individual = supabase.table("individual_findings").insert(individual_findings_data).execute()
                            print(f"Supabase individual findings insert response: {response_individual}")
                            if response_individual.data:
                                print(f"Successfully stored {len(response_individual.data)} individual findings.")
                            else:
                                print(f"!!! Failed to store individual findings. Response: {response_individual.error or 'No data returned'}")
                        else:
                            print("--- No individual findings data prepared for insertion. ---")

            except Exception as e_supabase:
                print(f"!!! Error during Supabase operation: {e_supabase}")
                traceback.print_exc()
                # Don't raise HTTPException here, just log the error and return the summary if possible
        else:
            print("--- Supabase client not available, skipping database storage. ---")


        # Return the analysis results (even if Supabase failed)
        return results

    except HTTPException as http_exc:
         print(f"!!! Caught HTTPException: {http_exc.status_code} - {http_exc.detail}")
         raise http_exc # Re-raise HTTP exceptions
    except Exception as e_outer:
        print(f"!!! Unhandled error during analysis for user {user_id}: {e_outer}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal error occurred during analysis: {str(e_outer)}")

# --- Add uvicorn runner if needed ---
# ... (uvicorn runner remains the same) ...