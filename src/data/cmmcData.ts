import { CMMCDomain, CMMCPractice } from '../types';

export const cmmcDomains: CMMCDomain[] = [
  {
    id: 'AC',
    name: 'Access Control',
    description: 'Limit system access to authorized users, processes, and devices, and to authorized activities and transactions.'
  },
  {
    id: 'AM',
    name: 'Asset Management',
    description: 'Identify and manage assets throughout their lifecycle to ensure cybersecurity risk management.'
  },
  {
    id: 'AU',
    name: 'Audit and Accountability',
    description: 'Create, protect, and retain system audit records to enable monitoring, analysis, investigation, and reporting.'
  },
  {
    id: 'CM',
    name: 'Configuration Management',
    description: 'Establish and maintain baseline configurations and inventories of systems throughout their lifecycle.'
  },
  {
    id: 'IA',
    name: 'Identification and Authentication',
    description: 'Verify the identities of users, processes, or devices before allowing access to systems.'
  },
  {
    id: 'IR',
    name: 'Incident Response',
    description: 'Establish operational capabilities for incident handling to prepare, detect, analyze, contain, and recover from cybersecurity incidents.'
  },
  {
    id: 'MA',
    name: 'Maintenance',
    description: 'Perform maintenance on systems and provide effective controls on tools, techniques, and personnel.'
  },
  {
    id: 'MP',
    name: 'Media Protection',
    description: 'Protect system media containing sensitive data, both digital and non-digital.'
  },
  {
    id: 'PS',
    name: 'Personnel Security',
    description: 'Ensure individuals occupying positions of responsibility are trustworthy and meet security criteria.'
  },
  {
    id: 'PE',
    name: 'Physical Protection',
    description: 'Limit physical access to systems, equipment, and operating environments to authorized individuals.'
  },
  {
    id: 'RA',
    name: 'Risk Assessment',
    description: 'Assess operational risks to the organization from the operation and use of systems.'
  },
  {
    id: 'CA',
    name: 'Security Assessment',
    description: 'Periodically assess security controls to determine effectiveness and manage risk.'
  },
  {
    id: 'SC',
    name: 'System and Communications Protection',
    description: 'Monitor, control, and protect communications at system boundaries.'
  },
  {
    id: 'SI',
    name: 'System and Information Integrity',
    description: 'Identify, report, and correct information and system flaws in a timely manner.'
  },
  {
    id: 'RE',
    name: 'Recovery',
    description: 'Maintain plans for resilience and restore capabilities after disruption, compromise, or failure.'
  },
  {
    id: 'SA',
    name: 'Situational Awareness',
    description: 'Implement threat monitoring to support risk management decisions.'
  },
  {
    id: 'SR',
    name: 'Supply Chain Risk Management',
    description: 'Identify, assess, and manage supply chain risks.'
  }
];

export const cmmcPractices: CMMCPractice[] = [
  // Access Control (AC)
  {
    id: 'AC.1.001',
    domainId: 'AC',
    name: 'Limit information system access to authorized users',
    description: 'Limit information system access to authorized users, processes acting on behalf of authorized users, and devices (including other information systems).',
    level: 1
  },
  {
    id: 'AC.1.002',
    domainId: 'AC',
    name: 'Limit system access to types of transactions and functions',
    description: 'Limit information system access to the types of transactions and functions that authorized users are permitted to execute.',
    level: 1
  },
  {
    id: 'AC.2.007',
    domainId: 'AC',
    name: 'Employ principle of least privilege',
    description: 'Employ the principle of least privilege, including for specific security functions and privileged accounts.',
    level: 2
  },
  {
    id: 'AC.2.008',
    domainId: 'AC',
    name: 'Use non-privileged accounts',
    description: 'Use non-privileged accounts or roles when accessing nonsecurity functions.',
    level: 2
  },
  {
    id: 'AC.2.013',
    domainId: 'AC',
    name: 'Monitor and control remote access sessions',
    description: 'Monitor and control remote access sessions.',
    level: 2
  },
  {
    id: 'AC.3.017',
    domainId: 'AC',
    name: 'Separate duties of individuals',
    description: 'Separate the duties of individuals to reduce the risk of malevolent activity without collusion.',
    level: 3
  },
  {
    id: 'AC.3.018',
    domainId: 'AC',
    name: 'Prevent non-privileged users from executing privileged functions',
    description: 'Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.',
    level: 3
  },
  {
    id: 'AC.3.019',
    domainId: 'AC',
    name: 'Terminate sessions after period of inactivity',
    description: 'Terminate (automatically) user sessions after a defined condition.',
    level: 3
  },
  {
    id: 'AC.3.020',
    domainId: 'AC',
    name: 'Control connection of mobile devices',
    description: 'Control connection of mobile devices.',
    level: 3
  },
  {
    id: 'AC.3.021',
    domainId: 'AC',
    name: 'Authorize remote execution of privileged commands',
    description: 'Authorize remote execution of privileged commands and remote access to security-relevant information.',
    level: 3
  },
  {
    id: 'AC.3.022',
    domainId: 'AC',
    name: 'Encrypt CUI on mobile devices and mobile computing platforms',
    description: 'Encrypt CUI on mobile devices and mobile computing platforms.',
    level: 3
  },
  
  // Audit and Accountability (AU)
  {
    id: 'AU.2.041',
    domainId: 'AU',
    name: 'Ensure audit processing failure alerts',
    description: 'Alert in the event of an audit logging process failure.',
    level: 2
  },
  {
    id: 'AU.3.046',
    domainId: 'AU',
    name: 'Alert on audit log review',
    description: 'Alert personnel or roles when audit log review indicates inappropriate or unusual activity.',
    level: 3
  },
  {
    id: 'AU.3.048',
    domainId: 'AU',
    name: 'Collect audit information into a central repository',
    description: 'Collect audit information into one or more central repositories.',
    level: 3
  },
  {
    id: 'AU.3.049',
    domainId: 'AU',
    name: 'Protect audit information and tools',
    description: 'Protect audit information and audit logging tools from unauthorized access, modification, and deletion.',
    level: 3
  },
  {
    id: 'AU.3.050',
    domainId: 'AU',
    name: 'Correlate audit record review across different repositories',
    description: 'Correlate audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity.',
    level: 3
  },
  {
    id: 'AU.3.051',
    domainId: 'AU',
    name: 'Provide audit record reduction and report generation',
    description: 'Provide audit record reduction and report generation to analyze and report audit information.',
    level: 3
  },
  {
    id: 'AU.3.052',
    domainId: 'AU',
    name: 'Provide capability to process audit logs',
    description: 'Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.',
    level: 3
  },
  
  // Configuration Management (CM)
  {
    id: 'CM.2.061',
    domainId: 'CM',
    name: 'Establish and maintain baseline configurations',
    description: 'Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles.',
    level: 2
  },
  {
    id: 'CM.2.062',
    domainId: 'CM',
    name: 'Employ the principle of least functionality',
    description: 'Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.',
    level: 2
  },
  {
    id: 'CM.2.063',
    domainId: 'CM',
    name: 'Control and monitor user-installed software',
    description: 'Control and monitor user-installed software.',
    level: 2
  },
  {
    id: 'CM.2.064',
    domainId: 'CM',
    name: 'Establish and enforce security configuration settings',
    description: 'Establish and enforce security configuration settings for information technology products employed in organizational systems.',
    level: 2
  },
  {
    id: 'CM.2.065',
    domainId: 'CM',
    name: 'Track, review, approve, or disapprove changes to systems',
    description: 'Track, review, approve or disapprove, and log changes to organizational systems.',
    level: 2
  },
  {
    id: 'CM.2.066',
    domainId: 'CM',
    name: 'Analyze security impact of changes',
    description: 'Analyze the security impact of changes prior to implementation.',
    level: 2
  },
  {
    id: 'CM.3.067',
    domainId: 'CM',
    name: 'Define, document, approve, and enforce physical and logical access restrictions',
    description: 'Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.',
    level: 3
  },
  {
    id: 'CM.3.068',
    domainId: 'CM',
    name: 'Restrict, disable, or prevent use of nonessential programs, functions, ports, protocols, and services',
    description: 'Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.',
    level: 3
  },
  {
    id: 'CM.3.069',
    domainId: 'CM',
    name: 'Apply deny-by-exception policy to prevent unauthorized software execution',
    description: 'Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software or deny-all, permit-by-exception (whitelisting) policy to allow the execution of authorized software.',
    level: 3
  },

  // System and Communications Protection (SC)
  {
    id: 'SC.1.175',
    domainId: 'SC',
    name: 'Monitor, control, and protect communications',
    description: 'Monitor, control, and protect organizational communications (i.e., information transmitted or received by organizational information systems) at the external boundaries and key internal boundaries of the information systems.',
    level: 1
  },
  {
    id: 'SC.1.176',
    domainId: 'SC',
    name: 'Implement subnetworks for publicly accessible system components',
    description: 'Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.',
    level: 1
  },
  {
    id: 'SC.3.177',
    domainId: 'SC',
    name: 'Employ FIPS-validated cryptography',
    description: 'Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.',
    level: 3
  },
  {
    id: 'SC.3.180',
    domainId: 'SC',
    name: 'Employ architectural designs, software development techniques, and systems engineering principles',
    description: 'Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.',
    level: 3
  },
  {
    id: 'SC.3.181',
    domainId: 'SC',
    name: 'Separate user functionality from system management functionality',
    description: 'Separate user functionality from system management functionality.',
    level: 3
  },
  {
    id: 'SC.3.182',
    domainId: 'SC',
    name: 'Prevent unauthorized and unintended information transfer',
    description: 'Prevent unauthorized and unintended information transfer via shared system resources.',
    level: 3
  },
  {
    id: 'SC.3.183',
    domainId: 'SC',
    name: 'Deny network communications traffic by default',
    description: 'Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception).',
    level: 3
  },
  {
    id: 'SC.3.184',
    domainId: 'SC',
    name: 'Prevent remote devices from simultaneously establishing non-remote connections',
    description: 'Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling).',
    level: 3
  },
  {
    id: 'SC.3.185',
    domainId: 'SC',
    name: 'Implement cryptographic mechanisms to prevent unauthorized disclosure',
    description: 'Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.',
    level: 3
  },
  {
    id: 'SC.3.186',
    domainId: 'SC',
    name: 'Terminate network connections associated with communications sessions',
    description: 'Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity.',
    level: 3
  },
  {
    id: 'SC.3.187',
    domainId: 'SC',
    name: 'Establish and manage cryptographic keys',
    description: 'Establish and manage cryptographic keys for cryptography employed in organizational systems.',
    level: 3
  },
  {
    id: 'SC.3.188',
    domainId: 'SC',
    name: 'Control and monitor the use of mobile code',
    description: 'Control and monitor the use of mobile code.',
    level: 3
  },
  {
    id: 'SC.3.189',
    domainId: 'SC',
    name: 'Control and monitor the use of Voice over Internet Protocol (VoIP)',
    description: 'Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.',
    level: 3
  },
  {
    id: 'SC.3.190',
    domainId: 'SC',
    name: 'Protect the authenticity of communications sessions',
    description: 'Protect the authenticity of communications sessions.',
    level: 3
  },
  {
    id: 'SC.3.191',
    domainId: 'SC',
    name: 'Protect the confidentiality of CUI at rest',
    description: 'Protect the confidentiality of CUI at rest.',
    level: 3
  },
  {
    id: 'SC.3.192',
    domainId: 'SC',
    name: 'Implement Domain Name System (DNS) filtering services',
    description: 'Implement Domain Name System (DNS) filtering services.',
    level: 3
  },
  {
    id: 'SC.3.193',
    domainId: 'SC',
    name: 'Implement a policy restricting the publication of CUI on externally owned, publicly accessible websites',
    description: 'Implement a policy restricting the publication of CUI on externally owned, publicly accessible websites (e.g., forums, LinkedIn, Facebook, Twitter, etc.).',
    level: 3
  }
];