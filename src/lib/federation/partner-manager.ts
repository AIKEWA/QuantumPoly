/**
 * @fileoverview Federation Partner Manager
 * @module lib/federation/partner-manager
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Manages federation partners: loading, validation, CRUD operations.
 * Supports both static configuration and dynamic registration.
 */

import fs from 'fs';
import path from 'path';

import { PartnerConfig } from './types';

/**
 * Partner configuration file path
 */
const PARTNER_CONFIG_PATH = path.join(process.cwd(), 'config', 'federation-partners.json');

/**
 * In-memory cache of partners (for runtime additions)
 */
let runtimePartners: PartnerConfig[] = [];

/**
 * Load partners from static configuration file
 */
export function loadStaticPartners(): PartnerConfig[] {
  try {
    if (!fs.existsSync(PARTNER_CONFIG_PATH)) {
      console.warn('Federation partner config not found, returning empty list');
      return [];
    }

    const configData = fs.readFileSync(PARTNER_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configData);

    if (!config.partners || !Array.isArray(config.partners)) {
      console.error('Invalid partner config format: missing "partners" array');
      return [];
    }

    return config.partners as PartnerConfig[];
  } catch (error) {
    console.error('Failed to load static partners:', error);
    return [];
  }
}

/**
 * Get all partners (static + runtime)
 */
export function getAllPartners(): PartnerConfig[] {
  const staticPartners = loadStaticPartners();
  return [...staticPartners, ...runtimePartners];
}

/**
 * Get active partners only
 */
export function getActivePartners(): PartnerConfig[] {
  return getAllPartners().filter((p) => p.active);
}

/**
 * Get partner by ID
 */
export function getPartnerById(partnerId: string): PartnerConfig | null {
  const partners = getAllPartners();
  return partners.find((p) => p.partner_id === partnerId) || null;
}

/**
 * Validate partner configuration
 */
export function validatePartner(partner: Partial<PartnerConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partner.partner_id) {
    errors.push('partner_id is required');
  } else if (!/^[a-zA-Z0-9._-]+$/.test(partner.partner_id)) {
    errors.push('partner_id must contain only alphanumeric characters, dots, underscores, and hyphens');
  }

  if (!partner.partner_display_name) {
    errors.push('partner_display_name is required');
  } else if (partner.partner_display_name.length < 3) {
    errors.push('partner_display_name must be at least 3 characters');
  }

  if (!partner.governance_endpoint) {
    errors.push('governance_endpoint is required');
  } else if (!partner.governance_endpoint.startsWith('http://') && !partner.governance_endpoint.startsWith('https://')) {
    errors.push('governance_endpoint must be a valid HTTP/HTTPS URL');
  }

  if (partner.stale_threshold_days !== undefined) {
    if (typeof partner.stale_threshold_days !== 'number' || partner.stale_threshold_days < 1) {
      errors.push('stale_threshold_days must be a positive number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Add partner dynamically (runtime registration)
 * Does NOT modify static config file.
 */
export function addPartner(partner: Omit<PartnerConfig, 'added_at'>): { success: boolean; error?: string } {
  // Validate partner
  const validation = validatePartner(partner);
  if (!validation.valid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
    };
  }

  // Check for duplicate
  const existing = getPartnerById(partner.partner_id);
  if (existing) {
    return {
      success: false,
      error: `Partner with ID "${partner.partner_id}" already exists`,
    };
  }

  // Add to runtime cache
  const newPartner: PartnerConfig = {
    ...partner,
    added_at: new Date().toISOString(),
    active: partner.active !== undefined ? partner.active : true,
    stale_threshold_days: partner.stale_threshold_days || 30,
  };

  runtimePartners.push(newPartner);

  return { success: true };
}

/**
 * Update partner configuration (runtime only)
 */
export function updatePartner(
  partnerId: string,
  updates: Partial<PartnerConfig>
): { success: boolean; error?: string } {
  const partnerIndex = runtimePartners.findIndex((p) => p.partner_id === partnerId);

  if (partnerIndex === -1) {
    return {
      success: false,
      error: `Partner "${partnerId}" not found in runtime partners (static partners cannot be updated at runtime)`,
    };
  }

  // Validate updates
  const updatedPartner = { ...runtimePartners[partnerIndex], ...updates };
  const validation = validatePartner(updatedPartner);
  if (!validation.valid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
    };
  }

  runtimePartners[partnerIndex] = updatedPartner;

  return { success: true };
}

/**
 * Remove partner (runtime only)
 */
export function removePartner(partnerId: string): { success: boolean; error?: string } {
  const partnerIndex = runtimePartners.findIndex((p) => p.partner_id === partnerId);

  if (partnerIndex === -1) {
    return {
      success: false,
      error: `Partner "${partnerId}" not found in runtime partners (static partners cannot be removed at runtime)`,
    };
  }

  runtimePartners.splice(partnerIndex, 1);

  return { success: true };
}

/**
 * Deactivate partner (marks as inactive without removing)
 */
export function deactivatePartner(partnerId: string): { success: boolean; error?: string } {
  return updatePartner(partnerId, { active: false });
}

/**
 * Activate partner
 */
export function activatePartner(partnerId: string): { success: boolean; error?: string } {
  return updatePartner(partnerId, { active: true });
}

/**
 * Get partner count statistics
 */
export function getPartnerStats(): {
  total: number;
  active: number;
  inactive: number;
  static: number;
  runtime: number;
} {
  const allPartners = getAllPartners();
  const staticPartners = loadStaticPartners();

  return {
    total: allPartners.length,
    active: allPartners.filter((p) => p.active).length,
    inactive: allPartners.filter((p) => !p.active).length,
    static: staticPartners.length,
    runtime: runtimePartners.length,
  };
}

/**
 * Clear runtime partners (for testing)
 */
export function clearRuntimePartners(): void {
  runtimePartners = [];
}

