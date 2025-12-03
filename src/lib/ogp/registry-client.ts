export interface RegistryStats {
  totalStandards: number;
  latestVersion: string;
  certifiedNodes: number;
  lastUpdated: string;
}

export interface StandardEntry {
  id: string;
  name: string;
  version: string;
  status: 'DRAFT' | 'RATIFIED' | 'DEPRECATED';
  hash: string;
}

// Mock Data for Phase 1 - In Phase 2 this would connect to the distributed ledger
const MOCK_REGISTRY_DATA: StandardEntry[] = [
  {
    id: 'OGP-CORE',
    name: 'Open Governance Protocol Core',
    version: '1.0.0',
    status: 'DRAFT',
    hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'OGP-P-01',
    name: 'Policy Artifact Schema',
    version: '0.9.0',
    status: 'DRAFT',
    hash: 'sha256:a1b2c3d4...',
  },
  {
    id: 'OGP-GENESIS',
    name: 'Genesis Charter',
    version: '1.0.0',
    status: 'RATIFIED',
    hash: 'sha256:f9e8d7c6...',
  },
];

export async function getRegistryStats(): Promise<RegistryStats> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    totalStandards: MOCK_REGISTRY_DATA.length,
    latestVersion: '1.0.0 (Genesis)',
    certifiedNodes: 1, // QuantumPoly Reference Node
    lastUpdated: new Date().toISOString(),
  };
}

export async function getStandardsList(): Promise<StandardEntry[]> {
  return MOCK_REGISTRY_DATA;
}
