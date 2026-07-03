import { expect, type Page } from '@playwright/test';

const ACCEPT_ALL_LABEL = /accept all|allow all|alle akzeptieren|tout accepter|aceptar todo|accetta tutto|tumunu kabul/i;
const CUSTOMIZE_LABEL = /customize settings|customi[sz]e|einstellungen|personnalis|personalizar|personalizza|ozellestir/i;
const SAVE_LABEL = /save|speichern|enregistrer|guardar|salva|kaydet/i;

/**
 * Dismisses the consent banner when present. No-ops when already dismissed.
 */
export async function dismissConsent(page: Page): Promise<void> {
  const persistConsentState = async () => {
    await page.evaluate(() => {
      const state = {
        preferences: { essential: true, analytics: true, performance: true },
        timestamp: new Date().toISOString(),
        policyVersion: 'v1.0.0',
        userId: crypto.randomUUID(),
        hasConsented: true,
      };

      localStorage.setItem('quantumpoly_consent', JSON.stringify(state));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'quantumpoly_consent',
          newValue: JSON.stringify(state),
          storageArea: localStorage,
        }),
      );
    });
  };

  await persistConsentState();

  const banner = page.locator('div[role="dialog"][aria-labelledby="consent-banner-title"]').first();
  let bannerVisible = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    bannerVisible = await banner.isVisible().catch(() => false);
    if (bannerVisible) {
      break;
    }
    await page.waitForTimeout(250);
  }

  if (!bannerVisible) {
    return;
  }

  const acceptAll = banner.getByRole('button', { name: ACCEPT_ALL_LABEL }).first();
  if (await acceptAll.isVisible().catch(() => false)) {
    await acceptAll.click();
    await banner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  if (await banner.isVisible().catch(() => false)) {
    const customize = banner.getByRole('button', { name: CUSTOMIZE_LABEL }).first();
    if (!(await customize.isVisible().catch(() => false))) {
      // Continue to fallback path below.
    } else {
    await customize.click();

    const modal = page.locator('div[role="dialog"][aria-labelledby="consent-modal-title"]').first();
    if (await modal.isVisible().catch(() => false)) {
      const save = modal.getByRole('button', { name: SAVE_LABEL }).first();
      if (await save.isVisible().catch(() => false)) {
        await save.click();
      } else {
        const modalAccept = modal.getByRole('button', { name: ACCEPT_ALL_LABEL }).first();
        if (await modalAccept.isVisible().catch(() => false)) {
          await modalAccept.click();
        }
      }
    }

      await banner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  }

  if (await banner.isVisible().catch(() => false)) {
    await persistConsentState();
    await expect(banner).toBeHidden({ timeout: 3000 });
  }
}
