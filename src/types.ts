/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttackType = 'DDoS' | 'Probing' | 'Malware' | 'Ransomware' | 'Botnet';

export interface TTP {
  tactic: string;
  technique: string;
  description: string;
}

export interface AttackRecord {
  id: string;
  timestamp: string;
  type: AttackType;
  sourceIp: string;
  targetDevice: string;
  status: 'Detected' | 'Engaged' | 'Neutralized';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  interactionDuration: number; // in seconds
  commandsCaptured: string[];
  // Research-based fields
  sophistication: 'Low' | 'Moderate' | 'High' | 'Advanced';
  classificationConfidence: number; // 0-1
  deceptionStrategy: string;
  resourceCost: number; // relative cost 0-100
  // New detailed fields
  description: string;
  attackerDevice: string;
  attackerLocation: string;
  targetDeviceId: string;
  ttps?: TTP[];
}

export interface ResourceMetric {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  networkOverhead: number;
  energyEfficiency: number;
}

export interface SystemStatus {
  honeypotActive: boolean;
  threatLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
  captureRate: number;
  detectionAccuracy: number;
  totalAttacks: number;
  // Research-based fields
  aiModelVersion: string;
  deceptionRealism: number; // 0-100
  resourceEfficiencyScore: number; // 0-100
}

export interface DeviceStatus {
  id: string;
  name: string;
  type: 'Smart Camera' | 'Industrial Sensor' | 'Smart Lock' | 'Medical Monitor' | 'Gateway';
  status: 'Online' | 'Offline' | 'Compromised' | 'Under Attack';
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastActivity: string;
  dataUsage: number; // MB
  batteryLevel?: number; // %
}

export interface AIConfig {
  learningRate: number;
  deceptionAggressiveness: number;
  resourceConstraint: number;
  responseDelay: number;
}
