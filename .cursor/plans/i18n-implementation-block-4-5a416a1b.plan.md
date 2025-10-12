<!-- 5a416a1b-ef9c-486d-9ad8-243d610e32af 46497450-b538-44bd-8869-0e6c402b3128 -->
# Internationalization Implementation — ADR Block 4

## Objective

Implement ADR-005 (Internationalization Architecture) to enable multi-language support for QuantumPoly website with English (default), German, and Turkish locales using `next-intl` framework.

## Prerequisites

- ✅ ADR-005 documented and accepted (2025-09-11)
- ✅ All components designed as i18n-ready (prop-driven, no hardcoded text)
- ✅ `src/locales/` directory structure prepared

## Implementation Phases

### Phase 1: Foundation Setup

**Goal**: Install next-intl, configure routing, and establish locale structure

**Tasks**:

1. Install `next-intl` package and configure TypeScript integration
2. Create `src/i18n.ts` configuration file with locale definitions
3. Implement `src/middleware.ts` for locale detection and routing
4. Update `next.config.js` to support locale prefixes
5. Create initial message files:

- `src/locales/en/` (hero.json, about.json, vision.json, newsletter.json, footer.json, common.json)
- `src/locales/de/` (same structure)
- `src/locales/tr/` (same structure)

**Key Files**:

- `src/i18n.ts` (new)
- `src/middleware.ts` (new)
- `next.config.js` (update)
- `src/locales/{en,de,tr}/*.json` (new)

### Phase 2: App Router Migration

**Goal**: Migrate Next.js App Router pages to locale-aware structure

**Tasks**:

1. Refactor `src/app/page.tsx` to `src/app/[locale]/page.tsx`

- Extract hardcoded strings (lines 11-50 currently)
- Implement `useTranslations()` hook for each component
- Update component prop consumption with translation keys

2. Refactor `src/app/layout.tsx` to `src/app/[locale]/layout.tsx`

- Add locale parameter to RootLayout
- Wrap children with `NextIntlClientProvider`
- Update metadata generation for locale-specific SEO

3. Create locale-specific metadata generation function

**Key Files**:

- `src/app/[locale]/page.tsx` (refactor from `src/app/page.tsx`)
- `src/app/[locale]/layout.tsx` (refactor from `src/app/layout.tsx`)

### Phase 3: Component Integration

**Goal**: Update Storybook stories and create LanguageSwitcher component

**Tasks**:

1. Update Storybook decorators to include `NextIntlClientProvider`
2. Add locale-specific stories for each component (Default, German, Turkish variants)
3. Create `src/components/LanguageSwitcher.tsx`:

- Accessible dropdown with ARIA labeling
- Keyboard navigation support
- Current language indication
- URL preservation during locale switching

4. Integrate LanguageSwitcher into Footer component

**Key Files**:

- `.storybook/preview.tsx` (update decorators)
- `stories/*.stories.tsx` (update all stories)
- `src/components/LanguageSwitcher.tsx` (new)
- `src/components/Footer.tsx` (update)

### Phase 4: Testing & Quality Assurance

**Goal**: Ensure i18n implementation maintains test coverage and accessibility standards

**Tasks**:

1. Update component tests to wrap with `NextIntlClientProvider`
2. Add integration tests for locale switching flow
3. Create translation key validation script for CI
4. Update Lighthouse CI configuration to test all locales
5. Verify A11y = 1.0 maintained across all locales
6. Run full test suite: `npm run test:coverage`

**Key Files**:

- `__tests__/*.test.tsx` (update all test files)
- `scripts/validate-translations.ts` (new)
- `.github/workflows/ci.yml` (update)
- `lighthouserc.json` (update)

### Phase 5: Documentation & Handover

**Goal**: Document i18n patterns and create developer guidelines

**Tasks**:

1. Create `docs/I18N_GUIDE.md` with:

- Adding new languages
- Adding new translation keys
- Component i18n patterns
- Testing translated components

2. Update README.md with i18n section
3. Create `IMPLEMENTATION_SUMMARY_BLOCK4_FINAL.md`
4. Commit and push with message: `feat: implement internationalization (ADR-005) - Block 4`

**Key Files**:

- `docs/I18N_GUIDE.md` (new)
- `README.md` (update)
- `IMPLEMENTATION_SUMMARY_BLOCK4_FINAL.md` (new)

## Quality Gates

### Build & Tests

- [ ] `npm run build` succeeds for all locales
- [ ] `npm run test:coverage` maintains >80% coverage
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run type-check` passes with no errors

### Accessibility

- [ ] Lighthouse A11y score = 1.0 for all locales (en, de, tr)
- [ ] Screen reader compatibility verified
- [ ] Keyboard navigation works for LanguageSwitcher

### Functionality

- [ ] All 5 components display correct translations
- [ ] Locale switching preserves URL path
- [ ] Browser language detection works
- [ ] Cookie-based locale preference persists

## Success Criteria

- ✅ Multi-language support operational (en, de, tr)
- ✅ Zero breaking changes to existing functionality
- ✅ Type-safe translation keys with IDE autocompletion
- ✅ Lighthouse scores maintained (A11y = 1.0, Performance ≥ 0.95)
- ✅ Full test coverage maintained
- ✅ Comprehensive documentation for team

## Risk Mitigation

- **Bundle Size**: Monitor Next.js bundle analysis for locale-specific chunks
- **Performance**: Verify no FCP/LCP degradation with `next-intl`
- **SEO**: Confirm `hreflang` meta tags generated correctly
- **Backward Compatibility**: Test existing routes redirect to default locale

## Estimated Effort

- **Phase 1**: 2-3 hours (foundation setup)
- **Phase 2**: 2-3 hours (App Router migration)
- **Phase 3**: 2-3 hours (components + LanguageSwitcher)
- **Phase 4**: 2-3 hours (testing + CI integration)
- **Phase 5**: 1-2 hours (documentation)
- **Total**: 9-14 hours

## Notes

- Follow MASTERPLAN.md workflow: implement one block per sprint, commit + push after completion
- All ADR-005 requirements must be satisfied before marking Block 4 complete
- Next block (Block 5) will be Newsletter Backend per MASTERPLAN.md sequence

### To-dos

- [ ] Install next-intl package and create i18n configuration files (i18n.ts, middleware.ts)
- [ ] Create message JSON files for en, de, tr locales with initial translations
- [ ] Refactor app/ directory to [locale] structure (page.tsx, layout.tsx)
- [ ] Update Storybook decorators and create locale-specific stories
- [ ] Implement LanguageSwitcher component with accessibility features
- [ ] Update all tests to support i18n and add locale switching integration tests
- [ ] Add translation validation script and update CI workflows for multi-locale testing
- [ ] Create I18N_GUIDE.md and IMPLEMENTATION_SUMMARY_BLOCK4_FINAL.md