/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  Database, 
  Terminal, 
  Lock, 
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Monitor,
  Wifi,
  HardDrive,
  BarChart3,
  FileText,
  Download,
  Settings2,
  Info,
  BookOpen
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AttackRecord, ResourceMetric, SystemStatus, AttackType, AIConfig, DeviceStatus } from './types';
import { NetworkGraph } from './components/NetworkGraph';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data Generators
const generateMockAttacks = (count: number): AttackRecord[] => {
  const types: AttackType[] = ['DDoS', 'Probing', 'Malware', 'Ransomware', 'Botnet'];
  const severities: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];
  const statuses: ('Detected' | 'Engaged' | 'Neutralized')[] = ['Detected', 'Engaged', 'Neutralized'];
  const devices = [
    { id: 'DEV-001', name: 'Front Door Camera' },
    { id: 'DEV-002', name: 'Assembly Line Sensor' },
    { id: 'DEV-003', name: 'Main Entrance Lock' },
    { id: 'DEV-004', name: 'Patient Vitals Monitor' },
    { id: 'DEV-005', name: 'IoT Edge Gateway' }
  ];
  const sophistications: ('Low' | 'Moderate' | 'High' | 'Advanced')[] = ['Low', 'Moderate', 'High', 'Advanced'];
  const strategies = [
    'Synthetic Vulnerability Injection',
    'Dynamic Protocol Mimicry',
    'Isolated Sandbox Redirection',
    'Adaptive Response Throttling',
    'Heuristic Behavior Perturbation'
  ];

  const attackDescriptions: Record<AttackType, string[]> = {
    'DDoS': [
      'Volumetric traffic flood targeting the device\'s network interface, attempting to exhaust bandwidth and processing power.',
      'Application-layer HTTP/S flood mimicking legitimate user requests to overwhelm the device\'s web server.',
      'UDP reflection attack using compromised NTP servers to amplify traffic directed at the IoT gateway.'
    ],
    'Probing': [
      'Systematic port scanning to identify open services and potential entry points on the device.',
      'Vulnerability assessment targeting known CVEs in the device\'s firmware version.',
      'Banner grabbing and service identification to map the device\'s software stack.'
    ],
    'Malware': [
      'Attempted injection of a custom Mirai-variant binary via an unauthenticated Telnet session.',
      'Fileless malware execution attempt using a buffer overflow in the device\'s UPnP service.',
      'Rogue firmware update package containing a persistent backdoor and data exfiltration module.'
    ],
    'Ransomware': [
      'Encryption of local configuration files and user data, demanding payment for the decryption key.',
      'Locking the device\'s control interface and threatening to wipe the firmware if a ransom is not paid.',
      'Exfiltration of sensitive patient data followed by a threat to release it publicly unless a ransom is met.'
    ],
    'Botnet': [
      'Inclusion of the device into a global botnet for coordinated DDoS attacks against external targets.',
      'Command and Control (C2) communication established to receive instructions for distributed scanning.',
      'Lateral movement attempt from a compromised smart camera to the main industrial control sensor.'
    ]
  };

  const attackerDevices = [
    'Compromised Smart Toaster (Mirai Bot)',
    'Infected Industrial PLC (Stuxnet-like)',
    'Rogue Raspberry Pi 4 (Kali Linux)',
    'Compromised IP Camera (Dahua-variant)',
    'Infected Smart Fridge (Spam Bot)',
    'High-Performance VPS (Tor Exit Node)',
    'Compromised Home Router (MikroTik)'
  ];

  const attackerLocations = [
    'Moscow, Russia',
    'Shenzhen, China',
    'São Paulo, Brazil',
    'Tehran, Iran',
    'Kyiv, Ukraine',
    'Bucharest, Romania',
    'Pyongyang, North Korea'
  ];

  const ttpsByType: Record<AttackType, any[]> = {
    'DDoS': [
      { tactic: 'Impact', technique: 'Network Denial of Service', description: 'Flooding the network with excessive traffic to deny service to legitimate users.' },
      { tactic: 'Resource Exhaustion', technique: 'Endpoint Denial of Service', description: 'Overwhelming the device\'s processing capabilities with high-frequency requests.' }
    ],
    'Probing': [
      { tactic: 'Reconnaissance', technique: 'Active Scanning', description: 'Performing port scans and service identification to map the target network.' },
      { tactic: 'Discovery', technique: 'Network Service Discovery', description: 'Identifying active services and potential vulnerabilities on the IoT device.' }
    ],
    'Malware': [
      { tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', description: 'Exploiting known vulnerabilities in the device\'s web or management interface.' },
      { tactic: 'Execution', technique: 'Command and Scripting Interpreter', description: 'Executing malicious scripts or binaries via compromised shells.' }
    ],
    'Ransomware': [
      { tactic: 'Impact', technique: 'Data Encrypted for Impact', description: 'Encrypting critical system and user data to demand a ransom for decryption.' },
      { tactic: 'Exfiltration', technique: 'Exfiltration Over C2 Channel', description: 'Exfiltrating sensitive data before encryption to increase leverage.' }
    ],
    'Botnet': [
      { tactic: 'Command and Control', technique: 'Application Layer Protocol', description: 'Using standard protocols like HTTP or IRC for C2 communication.' },
      { tactic: 'Persistence', technique: 'Boot or Logon Autostart Execution', description: 'Ensuring the botnet agent starts automatically upon device reboot.' }
    ]
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const target = devices[Math.floor(Math.random() * devices.length)];
    return {
      id: `ATT-${1000 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type,
      sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetDevice: target.name,
      targetDeviceId: target.id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      interactionDuration: Math.floor(Math.random() * 300) + 30,
      commandsCaptured: ['nmap -sV', 'exploit/multi/handler', 'getuid', 'shell'],
      sophistication: sophistications[Math.floor(Math.random() * sophistications.length)],
      classificationConfidence: 0.85 + Math.random() * 0.14,
      deceptionStrategy: strategies[Math.floor(Math.random() * strategies.length)],
      resourceCost: 15 + Math.random() * 45,
      description: attackDescriptions[type][Math.floor(Math.random() * attackDescriptions[type].length)],
      attackerDevice: attackerDevices[Math.floor(Math.random() * attackerDevices.length)],
      attackerLocation: attackerLocations[Math.floor(Math.random() * attackerLocations.length)],
      ttps: ttpsByType[type]
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockResources = (count: number): ResourceMetric[] => {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpuUsage: 15 + Math.random() * 25,
    memoryUsage: 30 + Math.random() * 15,
    networkOverhead: 5 + Math.random() * 10,
    energyEfficiency: 85 + Math.random() * 10
  }));
};

const generateMockDevices = (): DeviceStatus[] => {
  const deviceTypes: DeviceStatus['type'][] = ['Smart Camera', 'Industrial Sensor', 'Smart Lock', 'Medical Monitor', 'Gateway'];
  return [
    { id: 'DEV-001', name: 'Front Door Camera', type: 'Smart Camera', status: 'Online', threatLevel: 'Low', lastActivity: '2 mins ago', dataUsage: 124.5, batteryLevel: 85 },
    { id: 'DEV-002', name: 'Assembly Line Sensor', type: 'Industrial Sensor', status: 'Online', threatLevel: 'Low', lastActivity: 'Just now', dataUsage: 45.2 },
    { id: 'DEV-003', name: 'Main Entrance Lock', type: 'Smart Lock', status: 'Online', threatLevel: 'Low', lastActivity: '15 mins ago', dataUsage: 2.1, batteryLevel: 92 },
    { id: 'DEV-004', name: 'Patient Vitals Monitor', type: 'Medical Monitor', status: 'Online', threatLevel: 'Low', lastActivity: 'Just now', dataUsage: 89.7, batteryLevel: 100 },
    { id: 'DEV-005', name: 'IoT Edge Gateway', type: 'Gateway', status: 'Online', threatLevel: 'Low', lastActivity: 'Just now', dataUsage: 567.8 }
  ];
};

export default function App() {
  const [attacks, setAttacks] = useState<AttackRecord[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([]);
  const [status, setStatus] = useState<SystemStatus>({
    honeypotActive: true,
    threatLevel: 'Low',
    captureRate: 94.2,
    detectionAccuracy: 98.7,
    totalAttacks: 124,
    aiModelVersion: 'v2.4.1-stable',
    deceptionRealism: 88.5,
    resourceEfficiencyScore: 92.3
  });
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    learningRate: 0.001,
    deceptionAggressiveness: 75,
    resourceConstraint: 40,
    responseDelay: 150
  });
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'attacks' | 'resources' | 'research' | 'simulation' | 'devices'>('overview');
  const [attackView, setAttackView] = useState<'list' | 'graph'>('list');
  const [selectedAttack, setSelectedAttack] = useState<AttackRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isContinuousSim, setIsContinuousSim] = useState(false);
  const [threatAlert, setThreatAlert] = useState<{ message: string; type: 'Critical' | 'High' } | null>(null);
  const [simParams, setSimParams] = useState({
    type: 'DDoS' as AttackType,
    sophistication: 'Moderate' as 'Low' | 'Moderate' | 'High' | 'Advanced'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AttackType | 'All'>('All');

  const filteredAttacks = useMemo(() => {
    return attacks.filter(attack => {
      const matchesSearch = 
        attack.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attack.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attack.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attack.targetDevice.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'All' || attack.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [attacks, searchTerm, filterType]);

  useEffect(() => {
    setAttacks(generateMockAttacks(15));
    setResourceMetrics(generateMockResources(20));
    setDevices(generateMockDevices());

    const interval = setInterval(() => {
      setResourceMetrics(prev => {
        const last = prev[prev.length - 1];
        const next: ResourceMetric = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpuUsage: Math.max(10, Math.min(90, (last?.cpuUsage || 20) + (Math.random() * 10 - 5))),
          memoryUsage: Math.max(20, Math.min(80, (last?.memoryUsage || 40) + (Math.random() * 6 - 3))),
          networkOverhead: Math.max(2, Math.min(30, (last?.networkOverhead || 5) + (Math.random() * 4 - 2))),
          energyEfficiency: Math.max(80, Math.min(99, (last?.energyEfficiency || 90) + (Math.random() * 2 - 1)))
        };
        return [...prev.slice(1), next];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isContinuousSim) {
      interval = setInterval(() => {
        const types: AttackType[] = ['DDoS', 'Probing', 'Malware', 'Ransomware', 'Botnet'];
        const sophistications: ('Low' | 'Moderate' | 'High' | 'Advanced')[] = ['Low', 'Moderate', 'High', 'Advanced'];
        
        const attackDescriptions: Record<AttackType, string[]> = {
          'DDoS': [
            'Volumetric traffic flood targeting the device\'s network interface, attempting to exhaust bandwidth and processing power.',
            'Application-layer HTTP/S flood mimicking legitimate user requests to overwhelm the device\'s web server.',
            'UDP reflection attack using compromised NTP servers to amplify traffic directed at the IoT gateway.'
          ],
          'Probing': [
            'Systematic port scanning to identify open services and potential entry points on the device.',
            'Vulnerability assessment targeting known CVEs in the device\'s firmware version.',
            'Banner grabbing and service identification to map the device\'s software stack.'
          ],
          'Malware': [
            'Attempted injection of a custom Mirai-variant binary via an unauthenticated Telnet session.',
            'Fileless malware execution attempt using a buffer overflow in the device\'s UPnP service.',
            'Rogue firmware update package containing a persistent backdoor and data exfiltration module.'
          ],
          'Ransomware': [
            'Encryption of local configuration files and user data, demanding payment for the decryption key.',
            'Locking the device\'s control interface and threatening to wipe the firmware if a ransom is not paid.',
            'Exfiltration of sensitive patient data followed by a threat to release it publicly unless a ransom is met.'
          ],
          'Botnet': [
            'Inclusion of the device into a global botnet for coordinated DDoS attacks against external targets.',
            'Command and Control (C2) communication established to receive instructions for distributed scanning.',
            'Lateral movement attempt from a compromised smart camera to the main industrial control sensor.'
          ]
        };

        const attackerDevices = [
          'Compromised Smart Toaster (Mirai Bot)',
          'Infected Industrial PLC (Stuxnet-like)',
          'Rogue Raspberry Pi 4 (Kali Linux)',
          'Compromised IP Camera (Dahua-variant)',
          'Infected Smart Fridge (Spam Bot)',
          'High-Performance VPS (Tor Exit Node)',
          'Compromised Home Router (MikroTik)'
        ];

        const attackerLocations = [
          'Moscow, Russia',
          'Shenzhen, China',
          'São Paulo, Brazil',
          'Tehran, Iran',
          'Kyiv, Ukraine',
          'Bucharest, Romania',
          'Pyongyang, North Korea'
        ];

        const type = types[Math.floor(Math.random() * types.length)];
        const target = devices[Math.floor(Math.random() * devices.length)];
        
        const newAttack: AttackRecord = {
          id: `ATT-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          type,
          sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          targetDevice: target.name,
          targetDeviceId: target.id,
          status: 'Detected',
          severity: sophistications[Math.floor(Math.random() * 4)] === 'Advanced' ? 'Critical' : 'High',
          interactionDuration: 0,
          commandsCaptured: [],
          sophistication: sophistications[Math.floor(Math.random() * 4)],
          classificationConfidence: 0.8 + Math.random() * 0.15,
          deceptionStrategy: 'Adaptive Response Throttling',
          resourceCost: 20 + Math.random() * 30,
          description: attackDescriptions[type][Math.floor(Math.random() * attackDescriptions[type].length)],
          attackerDevice: attackerDevices[Math.floor(Math.random() * attackerDevices.length)],
          attackerLocation: attackerLocations[Math.floor(Math.random() * attackerLocations.length)]
        };

        if (newAttack.severity === 'Critical') {
          setThreatAlert({ message: `CRITICAL THREAT: ${newAttack.type} attack detected on ${newAttack.targetDevice}`, type: 'Critical' });
          setDevices(prev => prev.map(d => d.name === newAttack.targetDevice ? { ...d, status: 'Under Attack', threatLevel: 'Critical' } : d));
        }

        setAttacks(prev => [newAttack, ...prev.slice(0, 49)]); // Keep last 50
        setStatus(prev => ({ ...prev, totalAttacks: prev.totalAttacks + 1 }));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isContinuousSim]);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const attackDescriptions: Record<AttackType, string[]> = {
        'DDoS': [
          'Volumetric traffic flood targeting the device\'s network interface, attempting to exhaust bandwidth and processing power.',
          'Application-layer HTTP/S flood mimicking legitimate user requests to overwhelm the device\'s web server.',
          'UDP reflection attack using compromised NTP servers to amplify traffic directed at the IoT gateway.'
        ],
        'Probing': [
          'Systematic port scanning to identify open services and potential entry points on the device.',
          'Vulnerability assessment targeting known CVEs in the device\'s firmware version.',
          'Banner grabbing and service identification to map the device\'s software stack.'
        ],
        'Malware': [
          'Attempted injection of a custom Mirai-variant binary via an unauthenticated Telnet session.',
          'Fileless malware execution attempt using a buffer overflow in the device\'s UPnP service.',
          'Rogue firmware update package containing a persistent backdoor and data exfiltration module.'
        ],
        'Ransomware': [
          'Encryption of local configuration files and user data, demanding payment for the decryption key.',
          'Locking the device\'s control interface and threatening to wipe the firmware if a ransom is not paid.',
          'Exfiltration of sensitive patient data followed by a threat to release it publicly unless a ransom is met.'
        ],
        'Botnet': [
          'Inclusion of the device into a global botnet for coordinated DDoS attacks against external targets.',
          'Command and Control (C2) communication established to receive instructions for distributed scanning.',
          'Lateral movement attempt from a compromised smart camera to the main industrial control sensor.'
        ]
      };

      const attackerDevices = [
        'Compromised Smart Toaster (Mirai Bot)',
        'Infected Industrial PLC (Stuxnet-like)',
        'Rogue Raspberry Pi 4 (Kali Linux)',
        'Compromised IP Camera (Dahua-variant)',
        'Infected Smart Fridge (Spam Bot)',
        'High-Performance VPS (Tor Exit Node)',
        'Compromised Home Router (MikroTik)'
      ];

      const attackerLocations = [
        'Moscow, Russia',
        'Shenzhen, China',
        'São Paulo, Brazil',
        'Tehran, Iran',
        'Kyiv, Ukraine',
        'Bucharest, Romania',
        'Pyongyang, North Korea'
      ];

      const ttpsByType: Record<AttackType, any[]> = {
        'DDoS': [
          { tactic: 'Impact', technique: 'Network Denial of Service', description: 'Flooding the network with excessive traffic to deny service to legitimate users.' },
          { tactic: 'Resource Exhaustion', technique: 'Endpoint Denial of Service', description: 'Overwhelming the device\'s processing capabilities with high-frequency requests.' }
        ],
        'Probing': [
          { tactic: 'Reconnaissance', technique: 'Active Scanning', description: 'Performing port scans and service identification to map the target network.' },
          { tactic: 'Discovery', technique: 'Network Service Discovery', description: 'Identifying active services and potential vulnerabilities on the IoT device.' }
        ],
        'Malware': [
          { tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', description: 'Exploiting known vulnerabilities in the device\'s web or management interface.' },
          { tactic: 'Execution', technique: 'Command and Scripting Interpreter', description: 'Executing malicious scripts or binaries via compromised shells.' }
        ],
        'Ransomware': [
          { tactic: 'Impact', technique: 'Data Encrypted for Impact', description: 'Encrypting critical system and user data to demand a ransom for decryption.' },
          { tactic: 'Exfiltration', technique: 'Exfiltration Over C2 Channel', description: 'Exfiltrating sensitive data before encryption to increase leverage.' }
        ],
        'Botnet': [
          { tactic: 'Command and Control', technique: 'Application Layer Protocol', description: 'Using standard protocols like HTTP or IRC for C2 communication.' },
          { tactic: 'Persistence', technique: 'Boot or Logon Autostart Execution', description: 'Ensuring the botnet agent starts automatically upon device reboot.' }
        ]
      };

      const target = devices[Math.floor(Math.random() * devices.length)];

      const newAttack: AttackRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        type: simParams.type,
        sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        targetDevice: target.name,
        targetDeviceId: target.id,
        status: 'Detected',
        severity: simParams.sophistication === 'Advanced' ? 'Critical' : 'High',
        interactionDuration: 0,
        commandsCaptured: [],
        sophistication: simParams.sophistication,
        classificationConfidence: 0.92,
        deceptionStrategy: 'Dynamic Protocol Mimicry',
        resourceCost: 35,
        description: attackDescriptions[simParams.type][Math.floor(Math.random() * attackDescriptions[simParams.type].length)],
        attackerDevice: attackerDevices[Math.floor(Math.random() * attackerDevices.length)],
        attackerLocation: attackerLocations[Math.floor(Math.random() * attackerLocations.length)],
        ttps: ttpsByType[simParams.type]
      };
      setAttacks(prev => [newAttack, ...prev]);
      setStatus(prev => ({ ...prev, totalAttacks: prev.totalAttacks + 1, threatLevel: 'High' }));
      setIsSimulating(false);
      setActiveTab('attacks');
      setSelectedAttack(newAttack);
    }, 2000);
  };

  const generatePDFReport = (attack: AttackRecord) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('AI-Honeypot Security Incident Report', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
    
    // Incident Overview
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Incident Overview', 20, 40);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 42, 190, 42);
    
    doc.setFontSize(10);
    const overview = [
      ['Incident ID:', attack.id],
      ['Timestamp:', new Date(attack.timestamp).toLocaleString()],
      ['Attack Type:', attack.type],
      ['Severity:', attack.severity],
      ['Status:', attack.status],
      ['Target Device:', attack.targetDevice],
      ['Source IP:', attack.sourceIp]
    ];
    
    let y = 50;
    overview.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, y);
      y += 6;
    });
    
    // Attacker Profile
    y += 8;
    doc.setFontSize(14);
    doc.text('Attacker Profile', 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    
    const profile = [
      ['Attacker Device:', attack.attackerDevice],
      ['Attacker Location:', attack.attackerLocation],
      ['Sophistication:', attack.sophistication]
    ];
    
    profile.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, y);
      y += 6;
    });
    
    // Description
    y += 8;
    doc.setFontSize(14);
    doc.text('Incident Description', 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(attack.description, 170);
    doc.text(splitDescription, 20, y);
    y += (splitDescription.length * 5) + 8;
    
    // TTPs
    if (attack.ttps && attack.ttps.length > 0) {
      doc.setFontSize(14);
      doc.text('Tactics, Techniques, and Procedures (TTPs)', 20, y);
      doc.line(20, y + 2, 190, y + 2);
      y += 10;
      
      attack.ttps.forEach((ttp, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${ttp.tactic} - ${ttp.technique}`, 20, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const splitTtp = doc.splitTextToSize(ttp.description, 160);
        doc.text(splitTtp, 25, y);
        y += (splitTtp.length * 5) + 4;
        
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }
    
    // Captured Commands
    if (attack.commandsCaptured.length > 0) {
      y += 8;
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('Captured Commands', 20, y);
      doc.line(20, y + 2, 190, y + 2);
      y += 10;
      doc.setFont('courier', 'normal');
      attack.commandsCaptured.forEach(cmd => {
        doc.text(`> ${cmd}`, 25, y);
        y += 5;
        if (y > 280) { doc.addPage(); y = 20; }
      });
    }
    
    doc.save(`Security_Report_${attack.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans selection:bg-accent selection:text-bg">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex justify-between items-center bg-[#0A0A0B]/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-12 h-12 bg-black border border-accent/30 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,255,156,0.1)]">
              <Shield className="text-accent w-7 h-7" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-[-0.05em] uppercase leading-none text-white italic font-serif">AI_HONEYPOT</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              <p className="text-[8px] font-mono font-bold uppercase tracking-[0.3em] text-white/30">Adaptive Deception Matrix v1.0.4</p>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2 bg-black/40 p-1 border border-white/5 rounded-sm">
          {(['overview', 'attacks', 'devices', 'resources', 'research', 'simulation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                activeTab === tab ? "text-accent" : "text-white/40 hover:text-white/80"
              )}
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-white/5 border border-white/10" 
                />
              )}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-accent group-hover:w-1/2 transition-all duration-300" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">System_Integrity</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn("w-3 h-1", i < 4 ? "bg-accent/60" : "bg-white/10")} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 shadow-inner">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              status.honeypotActive ? "bg-accent animate-pulse shadow-[0_0_8px_rgba(0,255,156,0.5)]" : "bg-red-500"
            )} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
              {status.honeypotActive ? "Live_Ops" : "System_Offline"}
            </span>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Threat Alert Banner */}
        <AnimatePresence>
          {threatAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className={cn(
                "w-full relative overflow-hidden border-l-4 shadow-2xl",
                threatAlert.type === 'Critical' ? "bg-red-950/90 border-red-600" : "bg-amber-950/90 border-amber-600"
              )}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative p-5 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center animate-pulse",
                    threatAlert.type === 'Critical' ? "bg-red-600 text-white" : "bg-amber-600 text-black"
                  )}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] opacity-50 mb-1">Emergency_Broadcast</p>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">{threatAlert.message}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setThreatAlert(null)}
                  className="px-6 py-2 border border-white/20 text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all"
                >
                  Acknowledge
                </button>
              </div>
              <motion.div 
                className="absolute bottom-0 left-0 h-[2px] bg-white/20"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Threat Level', value: status.threatLevel, icon: AlertTriangle, color: 'text-red-500', trend: '+12%' },
                  { label: 'Deception Realism', value: `${status.deceptionRealism}%`, icon: Zap, color: 'text-blue-500', trend: 'Stable' },
                  { label: 'Resource Efficiency', value: `${status.resourceEfficiencyScore}%`, icon: Activity, color: 'text-emerald-500', trend: 'Optimal' },
                  { label: 'AI Model', value: status.aiModelVersion, icon: Database, color: 'text-accent', trend: 'v1.0.4' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative border border-white/10 p-5 bg-[#1A1A1A] shadow-2xl overflow-hidden">
                      <div className="absolute -right-4 -top-4 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
                        <stat.icon className="w-20 h-20" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn("p-2.5 bg-black/40 border border-white/5 shadow-inner", stat.color)}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono font-bold opacity-30 block">SEC_UNIT_0{i + 1}</span>
                          <span className="text-[8px] font-mono font-bold text-accent opacity-60">{stat.trend}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">{stat.label}</p>
                        <p className="text-3xl font-bold tracking-tighter uppercase text-white group-hover:text-accent transition-colors duration-300">
                          {stat.value}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex gap-1">
                        {[...Array(12)].map((_, j) => (
                          <div 
                            key={j} 
                            className={cn(
                              "h-1 w-full rounded-full transition-all duration-500",
                              j < (i + 1) * 3 ? "bg-accent/40" : "bg-white/5"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resource Efficiency Chart */}
                <div className="lg:col-span-2 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative border border-white/10 p-8 bg-[#1A1A1A] shadow-2xl overflow-hidden h-full">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                      <Activity className="w-48 h-48" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1 h-4 bg-accent" />
                          <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-white/90">Resource Telemetry Matrix</h3>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-white/30 tracking-widest">Real-time computational overhead analysis</p>
                      </div>
                      
                      <div className="flex items-center gap-6 bg-black/30 px-4 py-2 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">CPU_LOAD</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent shadow-[0_0_8px_rgba(0,255,156,0.5)]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">MEM_ALLOC</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={resourceMetrics}>
                          <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00FF9C" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" strokeOpacity={0.03} />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0A0A0B', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '0px', 
                              color: '#FFFFFF',
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cpuUsage" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorCpu)" 
                            strokeWidth={2} 
                            animationDuration={1500}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="memoryUsage" 
                            stroke="#00FF9C" 
                            fillOpacity={1} 
                            fill="url(#colorMem)" 
                            strokeWidth={2} 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-4 gap-4 border-t border-white/5 pt-6">
                      {[
                        { label: 'Avg Latency', value: '14ms' },
                        { label: 'Peak Load', value: '62%' },
                        { label: 'Cache Hit', value: '94%' },
                        { label: 'IOPS', value: '1.2k' }
                      ].map((m, i) => (
                        <div key={i}>
                          <p className="text-[8px] font-mono text-white/30 uppercase mb-1">{m.label}</p>
                          <p className="text-xs font-bold text-white/80">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Feed */}
                <div className="relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative border border-white/10 p-8 bg-[#141414] shadow-2xl flex flex-col h-full overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                      <Shield className="w-20 h-20 text-accent" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-1.5 bg-accent animate-pulse shadow-[0_0_8px_rgba(0,255,156,0.5)]" />
                      <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-white/90">Neural Live Feed</h3>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {attacks.slice(0, 10).map((attack, i) => (
                        <motion.div 
                          key={attack.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => { setSelectedAttack(attack); setActiveTab('attacks'); }}
                          className="group/item cursor-pointer border-l-2 border-white/5 pl-4 py-1 hover:border-accent transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[8px] font-mono text-white/30 group-hover/item:text-accent transition-colors">{attack.id}</span>
                            <span className={cn(
                              "text-[7px] font-bold uppercase px-1.5 py-0.5 tracking-tighter",
                              attack.severity === 'Critical' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-white/5 text-white/40 border border-white/10"
                            )}>
                              {attack.severity}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-white/80 group-hover/item:text-white transition-colors">{attack.type}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[8px] font-mono uppercase text-white/20">{attack.targetDevice}</p>
                            <p className="text-[8px] font-mono text-white/10">{new Date(attack.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setActiveTab('attacks')}
                      className="mt-8 w-full group/btn relative overflow-hidden border border-white/10 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all"
                    >
                      <div className="absolute inset-0 bg-white/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      <span className="relative">Access Command Console</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'attacks' && (
            <motion.div
              key="attacks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Attack List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-5 bg-accent" />
                      <h2 className="text-2xl font-bold tracking-tighter uppercase italic font-serif text-white/90">Command Console</h2>
                    </div>
                    <p className="text-[10px] font-mono uppercase text-white/30 tracking-[0.2em]">Neural Interaction Logs & Analysis</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-accent opacity-60" />
                      <input 
                        type="text" 
                        placeholder="SEARCH_LOGS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/40 border border-white/10 pl-9 pr-4 py-2 text-[9px] font-bold uppercase tracking-widest w-full md:w-56 focus:outline-none focus:border-accent/50 focus:bg-black/60 transition-all text-white/80"
                      />
                    </div>
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="bg-black/40 border border-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent/50 transition-all text-white/60 appearance-none cursor-pointer hover:bg-black/60"
                    >
                      <option value="All">ALL_VECTORS</option>
                      {['DDoS', 'Probing', 'Malware', 'Ransomware', 'Botnet'].map(t => (
                        <option key={t} value={t}>{t.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="flex border border-white/10 p-1 bg-black/20">
                      <button 
                        onClick={() => setAttackView('list')}
                        className={cn(
                          "px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all",
                          attackView === 'list' ? "bg-accent text-black" : "text-white/40 hover:text-white"
                        )}
                      >
                        List
                      </button>
                      <button 
                        onClick={() => setAttackView('graph')}
                        className={cn(
                          "px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all",
                          attackView === 'graph' ? "bg-accent text-black" : "text-white/40 hover:text-white"
                        )}
                      >
                        Graph
                      </button>
                    </div>
                  </div>
                </div>

                {attackView === 'graph' ? (
                  <div className="border border-white/10 bg-[#1A1A1A] rounded-sm overflow-hidden shadow-2xl">
                    <NetworkGraph 
                      attacks={filteredAttacks} 
                      onSelectAttack={setSelectedAttack} 
                      selectedAttackId={selectedAttack?.id} 
                    />
                  </div>
                ) : (
                  <div className="border border-white/10 overflow-hidden bg-[#1A1A1A] shadow-2xl">
                    <div className="grid grid-cols-5 p-5 border-b border-white/10 bg-black/40 text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] italic font-serif">
                      <span>ID_TIMESTAMP</span>
                      <span>ATTACK_VECTOR</span>
                      <span>TARGET_NODE</span>
                      <span>SOURCE_ORIGIN</span>
                      <span>STATUS</span>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[620px] overflow-y-auto custom-scrollbar">
                      {filteredAttacks.length > 0 ? (
                        filteredAttacks.map((attack, index) => (
                          <motion.div 
                            key={attack.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => setSelectedAttack(attack)}
                            className={cn(
                              "grid grid-cols-5 p-5 text-[11px] font-medium cursor-pointer transition-all duration-300",
                              selectedAttack?.id === attack.id 
                                ? "bg-accent/10 border-l-4 border-accent" 
                                : "hover:bg-white/5 border-l-4 border-transparent"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="font-mono text-[10px] text-accent/80">{attack.id}</span>
                              <span className="text-[8px] font-mono text-white/20">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                attack.severity === 'Critical' ? "text-red-500 bg-red-500" : "text-amber-500 bg-amber-500"
                              )} />
                              <span className={cn(
                                "font-bold uppercase tracking-tight",
                                selectedAttack?.id === attack.id ? "text-white" : "text-white/70"
                              )}>{attack.type}</span>
                            </div>
                            <span className="text-white/50 self-center">{attack.targetDevice}</span>
                            <span className="font-mono text-white/30 self-center">{attack.sourceIp}</span>
                            <div className="flex items-center">
                              <span className={cn(
                                "text-[8px] font-bold uppercase px-2 py-0.5 border tracking-widest",
                                selectedAttack?.id === attack.id 
                                  ? "border-accent text-accent bg-accent/5" 
                                  : "border-white/10 text-white/40"
                              )}>
                                {attack.status}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-24 text-center">
                          <Activity className="w-12 h-12 text-white/5 mx-auto mb-4" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Zero matching telemetry logs</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Attack Details Sidebar */}
              <div className="space-y-6">
                <div className="border border-white/10 bg-[#1A1A1A] p-8 sticky top-28 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                    <Terminal className="w-32 h-32" />
                  </div>
                  
                  {selectedAttack ? (
                    <div className="space-y-8 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold uppercase tracking-[0.15em] text-sm italic font-serif text-white/90">Neural Analysis</h3>
                          <p className="text-[8px] font-mono text-accent opacity-60">LOG_REF: {selectedAttack.id}</p>
                        </div>
                        <div className="w-10 h-10 bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                          <Terminal className="text-accent w-5 h-5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Severity_Level</p>
                          <p className={cn(
                            "text-[11px] font-bold uppercase tracking-widest",
                            selectedAttack.severity === 'Critical' ? "text-red-500" : "text-amber-500"
                          )}>{selectedAttack.severity}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Interaction_TTL</p>
                          <p className="text-[11px] font-bold uppercase text-white/80">{selectedAttack.interactionDuration}s</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Vector_Description</p>
                        <div className="p-4 bg-black/40 border border-white/5 text-[10px] leading-relaxed text-white/60 italic font-serif">
                          "{selectedAttack.description}"
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Origin_Node</p>
                          <p className="text-[11px] font-bold uppercase text-white/80">{selectedAttack.attackerDevice}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Geo_Origin</p>
                          <p className="text-[11px] font-bold uppercase text-white/80">{selectedAttack.attackerLocation}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-3 bg-emerald-500" />
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Captured_Payloads</p>
                        </div>
                        <div className="bg-black/60 p-5 border border-white/5 space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {selectedAttack.commandsCaptured.length > 0 ? (
                            selectedAttack.commandsCaptured.map((cmd, i) => (
                              <div key={i} className="flex gap-3 items-start group/cmd">
                                <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 group-hover/cmd:translate-x-1 transition-transform" />
                                <code className="text-[10px] text-emerald-400 font-mono break-all leading-relaxed">{cmd}</code>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-white/20 font-mono italic">Zero payloads intercepted...</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Deception_Logic</p>
                        <div className="p-4 border border-dashed border-white/10 text-[10px] leading-relaxed text-accent/70">
                          {selectedAttack.deceptionStrategy}
                        </div>
                      </div>

                      {selectedAttack.ttps && selectedAttack.ttps.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Tactical_Signature (TTPs)</p>
                          <div className="space-y-3">
                            {selectedAttack.ttps.map((ttp, i) => (
                              <div key={i} className="p-4 bg-black/40 border-l-2 border-accent/30 space-y-2 group/ttp hover:bg-black/60 transition-colors">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-mono uppercase text-accent group-hover/ttp:text-white transition-colors">{ttp.tactic}</span>
                                  <span className="text-[8px] font-mono uppercase text-white/20">{ttp.technique}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-white/50">{ttp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-accent" style={{ width: `${selectedAttack.classificationConfidence * 100}%` }} />
                            </div>
                            <p className="text-[10px] font-bold text-white/80">{(selectedAttack.classificationConfidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest">Sophistication</p>
                          <p className="text-[10px] font-bold uppercase text-accent">{selectedAttack.sophistication}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={() => generatePDFReport(selectedAttack)}
                          className="flex-1 py-3 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <FileText className="w-3 h-3" />
                          Export_PDF
                        </button>
                        <button className="flex-1 py-3 bg-red-600/10 border border-red-600/20 text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                          <Lock className="w-3 h-3" />
                          Purge_IP
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 border border-white/5 flex items-center justify-center mb-6 animate-pulse">
                        <Activity className="w-8 h-8 text-white/10" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Select log entry for deep analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter uppercase italic font-serif text-white/90">Resource Efficiency</h2>
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-[0.2em] text-accent">System overhead & performance metrics</p>
                </div>
                <div className="flex gap-6 w-full md:w-auto">
                  <div className="flex-1 md:flex-none text-right border-r border-white/10 pr-6">
                    <p className="text-[9px] font-mono uppercase opacity-50 mb-1 text-white/40">Avg CPU Load</p>
                    <p className="text-2xl font-bold tracking-tighter text-white/90">24.5%</p>
                  </div>
                  <div className="flex-1 md:flex-none text-right">
                    <p className="text-[9px] font-mono uppercase opacity-50 mb-1 text-white/40">Avg RAM Alloc</p>
                    <p className="text-2xl font-bold tracking-tighter text-white/90">1.2 GB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-white/10 bg-[#1A1A1A] p-6 relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Cpu className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold uppercase tracking-tight text-sm italic font-serif flex items-center gap-3 text-white/80">
                      <div className="p-1.5 bg-black/40 border border-white/10 text-accent rounded-sm">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      CPU Utilization
                    </h3>
                    <span className="text-[9px] font-mono font-bold opacity-30 text-white/40">UNIT_ID: 0x44A</span>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resourceMetrics}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold', fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#141414', border: '1px solid #ffffff10', borderRadius: '0px', padding: '8px' }}
                          itemStyle={{ color: '#E4E3E0', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }}
                          labelStyle={{ display: 'none' }}
                        />
                        <Line type="stepAfter" dataKey="cpuUsage" stroke="#F27D26" strokeWidth={2.5} dot={false} animationDuration={500} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 text-white/60">Active</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono opacity-40 uppercase text-white/40">Sampling Rate: 100ms</span>
                  </div>
                </div>

                <div className="border border-white/10 bg-[#1A1A1A] p-6 relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Monitor className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold uppercase tracking-tight text-sm italic font-serif flex items-center gap-3 text-white/80">
                      <div className="p-1.5 bg-black/40 border border-white/10 text-accent rounded-sm">
                        <Monitor className="w-3.5 h-3.5" />
                      </div>
                      Memory Allocation
                    </h3>
                    <span className="text-[9px] font-mono font-bold opacity-30 text-white/40">UNIT_ID: 0x44B</span>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={resourceMetrics}>
                        <defs>
                          <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F27D26" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold', fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#141414', border: '1px solid #ffffff10', borderRadius: '0px', padding: '8px' }}
                          itemStyle={{ color: '#E4E3E0', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }}
                          labelStyle={{ display: 'none' }}
                        />
                        <Area type="monotone" dataKey="memoryUsage" stroke="#F27D26" fill="url(#colorMem)" strokeWidth={2.5} animationDuration={500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 text-white/60">Reserved</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono opacity-40 uppercase text-white/40">Page Size: 4KB</span>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-[#141414] text-[#E4E3E0] p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
                        <Zap className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/80">Energy Efficiency</h4>
                    </div>
                    <p className="text-[11px] opacity-60 leading-relaxed font-medium text-white/60">
                      Optimized rule-based controller reduces power consumption by 34% compared to standard high-interaction honeypots.
                    </p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '34%' }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
                        <Wifi className="w-5 h-5 text-blue-500" />
                      </div>
                      <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/80">Network Overhead</h4>
                    </div>
                    <p className="text-[11px] opacity-60 leading-relaxed font-medium text-white/60">
                      Synthetic traffic generation is throttled to maintain &lt;5% network overhead on primary IoT communication channels.
                    </p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '5%' }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
                        <HardDrive className="w-5 h-5 text-amber-500" />
                      </div>
                      <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/80">Storage Optimization</h4>
                    </div>
                    <p className="text-[11px] opacity-60 leading-relaxed font-medium text-white/60">
                      Intelligent log compression and noise removal methodology preserves storage while maintaining full forensic integrity.
                    </p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulation' && (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-3xl mx-auto space-y-12 py-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold tracking-tighter uppercase italic font-serif text-white/90">Threat Simulation</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] w-12 bg-white/10" />
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-[0.3em] text-accent">Adaptive Deception Framework Testbed</p>
                  <div className="h-[1px] w-12 bg-white/10" />
                </div>
              </div>

              <div className="border border-white/10 bg-surface p-10 flex flex-col items-center space-y-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-black/40 border border-white/10 text-accent rounded-sm">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Attack Parameters</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-mono uppercase text-white/30 block font-bold tracking-widest">Attack Vector</label>
                        <select 
                          value={simParams.type}
                          onChange={(e) => setSimParams(prev => ({ ...prev, type: e.target.value as AttackType }))}
                          className="w-full bg-black/40 border-b-2 border-white/10 py-3 text-sm font-bold uppercase focus:border-accent transition-all outline-none cursor-pointer text-white/80"
                        >
                          {['DDoS', 'Probing', 'Malware', 'Ransomware', 'Botnet'].map(t => (
                            <option key={t} value={t} className="bg-surface text-white">{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-mono uppercase text-white/30 block font-bold tracking-widest">Sophistication</label>
                        <select 
                          value={simParams.sophistication}
                          onChange={(e) => setSimParams(prev => ({ ...prev, sophistication: e.target.value as any }))}
                          className="w-full bg-black/40 border-b-2 border-white/10 py-3 text-sm font-bold uppercase focus:border-accent transition-all outline-none cursor-pointer text-white/80"
                        >
                          {['Low', 'Moderate', 'High', 'Advanced'].map(s => (
                            <option key={s} value={s} className="bg-surface text-white">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                      <motion.div 
                        animate={ (isSimulating || isContinuousSim) ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className={cn(
                          "w-40 h-40 border-2 border-white/10 rounded-full flex items-center justify-center transition-all duration-500 relative",
                          (isSimulating || isContinuousSim) ? "border-dashed border-accent" : "border-solid opacity-20"
                        )}
                      >
                        <Zap className={cn("w-16 h-16 transition-colors", (isSimulating || isContinuousSim) ? "text-accent" : "text-white/20")} />
                        
                        {/* Decorative orbits */}
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border border-white/5 rounded-full scale-125"
                        />
                      </motion.div>
                      
                      <AnimatePresence>
                        {(isSimulating || isContinuousSim) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accent text-bg text-[9px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-[0.2em] shadow-xl whitespace-nowrap z-10"
                          >
                            {isContinuousSim ? "Live Stream Active" : "Attack In Progress"}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Engine Status</p>
                      <p className="text-sm font-bold uppercase tracking-widest">
                        {(isSimulating || isContinuousSim) ? (
                          <span className="text-accent animate-pulse">Transmitting Data...</span>
                        ) : (
                          <span className="text-white/40">System Ready</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col md:flex-row gap-6 pt-10 border-t border-white/10">
                  <button 
                    onClick={triggerSimulation}
                    disabled={isSimulating || isContinuousSim}
                    className={cn(
                      "flex-1 py-6 border border-white/10 text-[11px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3",
                      (isSimulating || isContinuousSim) 
                        ? "opacity-30 cursor-not-allowed grayscale" 
                        : "bg-white/5 text-white hover:bg-accent hover:text-bg hover:border-accent active:scale-95 shadow-lg"
                    )}
                  >
                    <Activity className="w-4 h-4" />
                    {isSimulating ? "Processing..." : "Single Research Simulation"}
                  </button>
                  <button 
                    onClick={() => setIsContinuousSim(!isContinuousSim)}
                    className={cn(
                      "flex-1 py-6 border border-white/10 text-[11px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3",
                      isContinuousSim 
                        ? "bg-red-600/20 text-red-500 border-red-600/50 shadow-2xl shadow-red-600/10" 
                        : "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-bg active:scale-95 shadow-lg"
                    )}
                  >
                    {isContinuousSim ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Stop Continuous Stream</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Start Continuous Stream</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 py-8"
            >
              <div className="flex justify-between items-end border-b border-white/10 pb-8">
                <div>
                  <h2 className="text-5xl font-bold tracking-tighter uppercase italic font-serif text-white/90">AI Configuration</h2>
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-[0.3em] mt-2 text-accent">Fine-tune the adaptive controller parameters</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-bg hover:border-accent transition-all flex items-center gap-3 shadow-xl active:scale-95">
                    <RefreshCw className="w-4 h-4" />
                    Reset Defaults
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Configuration Panel */}
                <div className="border border-white/10 bg-surface p-8 space-y-10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                    <Settings2 className="w-24 h-24" />
                  </div>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="p-1.5 bg-black/40 border border-white/10 text-accent rounded-sm">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold uppercase tracking-[0.1em] text-sm italic font-serif text-white/80">Hyperparameters</h3>
                  </div>
                  
                  <div className="space-y-10">
                    {[
                      { key: 'learningRate', label: 'Learning Rate', min: 0.0001, max: 0.01, step: 0.0001, value: aiConfig.learningRate, format: (v: number) => v.toFixed(4) },
                      { key: 'deceptionAggressiveness', label: 'Deception Aggressiveness', min: 0, max: 100, step: 1, value: aiConfig.deceptionAggressiveness, format: (v: number) => `${v}%` },
                      { key: 'resourceConstraint', label: 'Resource Constraint', min: 0, max: 100, step: 1, value: aiConfig.resourceConstraint, format: (v: number) => `${v}%` },
                      { key: 'responseDelay', label: 'Response Delay (ms)', min: 0, max: 1000, step: 10, value: aiConfig.responseDelay, format: (v: number) => `${v}ms` },
                    ].map((param) => (
                      <div key={param.key} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 text-white/60">{param.label}</label>
                          <span className="text-[11px] font-mono font-bold bg-black/40 text-accent px-3 py-1 border border-white/10 shadow-md">{param.format(param.value)}</span>
                        </div>
                        <div className="relative h-8 flex items-center group">
                          <input 
                            type="range" 
                            min={param.min} 
                            max={param.max} 
                            step={param.step}
                            value={param.value}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))}
                            className="w-full accent-accent h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer z-10"
                          />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-accent rounded-full pointer-events-none transition-all group-hover:shadow-[0_0_10px_rgba(0,255,156,0.5)]" style={{ width: `${((param.value - param.min) / (param.max - param.min)) * 100}%` }} />
                          
                          {/* Tick marks */}
                          <div className="absolute w-full flex justify-between px-1 pointer-events-none opacity-10">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-[1px] h-3 bg-white" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-start gap-3 p-4 bg-black/20 border border-white/5 rounded-sm">
                      <Info className="w-4 h-4 mt-0.5 text-accent opacity-60" />
                      <p className="text-[10px] font-mono leading-relaxed text-white/40 italic">
                        Adjusting these parameters will impact the trade-off between deception realism and resource consumption in real-time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Research Insights */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-white/10 p-8 bg-surface text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                        <Activity className="w-24 h-24" />
                      </div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-white/80">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        Deception vs. Cost Analysis
                      </h4>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={attacks.slice(0, 10).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="id" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0A0A0B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase', borderRadius: '0px' }}
                              itemStyle={{ color: '#FFFFFF' }}
                            />
                            <Line type="monotone" dataKey="resourceCost" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} name="Resource Cost" />
                            <Line type="monotone" dataKey="classificationConfidence" stroke="#00FF9C" strokeWidth={3} dot={{ r: 4, fill: '#00FF9C', strokeWidth: 0 }} name="Confidence" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="border border-white/10 p-8 bg-surface relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                        <Zap className="w-24 h-24" />
                      </div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-white/80 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        Energy Efficiency Trend
                      </h4>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={resourceMetrics}>
                            <defs>
                              <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#00FF9C" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="timestamp" hide />
                            <YAxis hide domain={[80, 100]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0A0A0B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase', borderRadius: '0px' }}
                            />
                            <Area type="monotone" dataKey="energyEfficiency" stroke="#00FF9C" fillOpacity={1} fill="url(#colorEfficiency)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/10 p-10 bg-surface relative shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                      <Activity className="w-48 h-48" />
                    </div>
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-black/40 border border-white/10 text-accent rounded-sm">
                          <Activity className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold uppercase tracking-[0.1em] text-sm italic font-serif text-white/90">Trade-off Optimization Insight</h4>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 border border-white/10 bg-white/5 text-white/60 hover:bg-accent hover:text-bg hover:border-accent transition-all flex items-center gap-3 shadow-md active:scale-95">
                        <FileText className="w-4 h-4" />
                        Export Insights
                      </button>
                    </div>
                    <div className="space-y-10 relative z-10">
                      <p className="text-base leading-relaxed font-serif italic text-white/70">
                        The current configuration shows an optimal balance at <span className="font-bold text-white border-b-2 border-amber-500/50">Aggressiveness: {aiConfig.deceptionAggressiveness}</span> and <span className="font-bold text-white border-b-2 border-blue-500/50">Constraint: {aiConfig.resourceConstraint}</span>. 
                        This results in a <span className="text-accent font-bold">{(90 + Math.random() * 5).toFixed(1)}% Efficiency Score</span> while maintaining a high deception realism of <span className="text-blue-400 font-bold">{(85 + Math.random() * 5).toFixed(1)}%</span>.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { label: 'Convergence', value: 'STABLE', color: 'text-accent' },
                          { label: 'Latency', value: `${(10 + Math.random() * 5).toFixed(0)}MS`, color: 'text-white' },
                          { label: 'Leakage Risk', value: 'LOW', color: 'text-accent' },
                        ].map((stat, i) => (
                          <div key={i} className="p-6 border border-white/10 bg-black/20 shadow-lg relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-accent transition-all" />
                            <p className="text-[10px] font-mono uppercase opacity-40 mb-2 font-bold tracking-widest text-white/60">{stat.label}</p>
                            <p className={cn("font-bold text-xl tracking-tighter", stat.color)}>{stat.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 pt-10 border-t border-white/5">
                        <h5 className="text-[11px] font-bold uppercase mb-4 flex items-center gap-3 opacity-80 text-white/90">
                          <BookOpen className="w-4 h-4 text-accent" /> Research Methodology Note
                        </h5>
                        <p className="text-[11px] opacity-40 italic leading-loose max-w-2xl text-white/60">
                          The framework utilizes a Reinforcement Learning agent with a reward function balancing deception longevity and computational overhead. 
                          Current observations suggest that increasing response delay beyond 400ms significantly improves deception realism but introduces unacceptable latency for real-time IoT control loops.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'devices' && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 py-8"
            >
              <div className="flex justify-between items-end border-b border-white/10 pb-8">
                <div>
                  <h2 className="text-5xl font-bold tracking-tighter uppercase italic font-serif text-white/90">IoT Fleet Status</h2>
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-[0.3em] mt-2 text-accent">Real-time usage and security status of connected devices</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-3 px-6 py-2.5 border border-white/10 bg-black/40 text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(0,255,156,0.5)]" />
                    Live Monitoring
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {devices.map((device) => (
                  <motion.div 
                    key={device.id} 
                    whileHover={{ y: -8 }}
                    className="border border-white/10 bg-surface p-8 flex flex-col justify-between group hover:border-accent/30 transition-all duration-500 relative overflow-hidden shadow-xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-accent transition-all" />
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full group-hover:bg-accent/5 transition-all" />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-sm border border-white/10 transition-all duration-500",
                          device.status === 'Under Attack' ? "bg-red-600/20 border-red-600 text-red-500" : "bg-black/40 text-accent group-hover:text-white"
                        )}>
                          <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base uppercase tracking-tight font-serif italic text-white/90">{device.name}</h3>
                          <p className="text-[10px] font-mono opacity-40 uppercase font-bold tracking-widest text-white/40">{device.type}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-[9px] font-bold uppercase px-3 py-1.5 rounded-sm border shadow-sm",
                        device.status === 'Online' ? "border-accent/30 text-accent bg-accent/5" : 
                        device.status === 'Under Attack' ? "bg-red-600/20 text-red-500 border-red-600/50 animate-pulse" : "border-red-600/30 text-red-500 bg-red-600/5"
                      )}>
                        {device.status}
                      </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-black/20 rounded-sm border border-white/5 transition-all">
                          <p className="text-[9px] font-mono uppercase opacity-40 mb-1 font-bold text-white/40">Threat Level</p>
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            device.threatLevel === 'Critical' ? "text-red-500" : 
                            device.threatLevel === 'High' ? "text-amber-500" : "text-accent"
                          )}>{device.threatLevel}</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-sm border border-white/5 transition-all">
                          <p className="text-[9px] font-mono uppercase opacity-40 mb-1 font-bold text-white/40">Data Usage</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-white/80">{device.dataUsage} MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-black/20 rounded-sm border border-white/5 transition-all">
                          <p className="text-[9px] font-mono uppercase opacity-40 mb-1 font-bold text-white/40">Last Activity</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-white/80">{device.lastActivity}</p>
                        </div>
                        {device.batteryLevel !== undefined && (
                          <div className="p-4 bg-black/20 rounded-sm border border-white/5 transition-all">
                            <p className="text-[9px] font-mono uppercase opacity-40 mb-2 font-bold text-white/40">Power</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${device.batteryLevel}%` }}
                                  className={cn(
                                    "h-full transition-all duration-1000",
                                    device.batteryLevel > 20 ? "bg-accent" : "bg-red-500"
                                  )} 
                                />
                              </div>
                              <span className="text-[10px] font-bold text-white/80">{device.batteryLevel}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4 relative z-10">
                      <button className="flex-1 py-3 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all active:scale-95 shadow-md">
                        Inspect
                      </button>
                      <button className="flex-1 py-3 border border-red-600/30 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-md">
                        Isolate
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Safety Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface text-white/70 px-8 py-3 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] z-50 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-12">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="opacity-40">System Status:</span>
            <span className="text-accent font-bold">Secure</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="opacity-40">Active Nodes:</span>
            <span className="font-bold text-white/90">12/12</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="opacity-40">Last Sync:</span>
            <span className="font-bold text-white/90">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-sm border border-white/10">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-white/80">Efficiency: 92%</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <p className="opacity-30 hover:opacity-100 transition-opacity cursor-default">© 2026 Adaptive Honeypot Framework</p>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
        }
      `}</style>
    </div>
  );
}
