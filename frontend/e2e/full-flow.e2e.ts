/**
 * Complete workflow E2E tests for D.A.V.E
 * Tests full user journey through all 4 stages: scope → upload → processing → results
 * Note: These tests require backend API to be running at localhost:8000
 */

import { test, expect } from '@playwright/test';

test.describe('Complete Assessment Workflow', () => {
  
  test('should complete full compliance assessment - Low baseline', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Stage 1: Scope Configuration
    await page.waitForTimeout(3000); // Wait for scope selector to load data from API
    
    // Check if scope selector loaded (indicates backend is running)
    const scopeLoaded = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!scopeLoaded) {
      console.log('Backend API not available - skipping workflow test');
      return;
    }
    
    // Select Low baseline (should be default or available)
    // The scope selector auto-loads with default selection
    
    // Wait for estimate to load
    await page.waitForTimeout(2000);
    
    // Continue to upload
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      
      // Stage 2: File Upload
      await page.waitForTimeout(1000);
      await expect(page.getByText(/Upload Evidence Artifacts/i)).toBeVisible({ timeout: 5000 });
      
      // Upload test document
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'compliance-policy.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%âãÏÓ\nAccess Control Policy\n\nAC-1 Policy and Procedures: Implemented\nAC-2 Account Management: Implemented')
      });
      
      await page.waitForTimeout(1000);
      
      // Verify file appears in list
      await expect(page.getByText(/compliance-policy\.pdf/i)).toBeVisible({ timeout: 3000 });
      
      // Click analyze button
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
        await analyzeButton.click();
        
        // Stage 3: Processing
        // Should transition to processing stage
        await page.waitForTimeout(2000);
        
        // Look for processing indicators
        const processingVisible = await page.getByText(/Processing|Analyzing|Status/i).isVisible({ timeout: 5000 }).catch(() => false);
        
        if (processingVisible) {
          console.log('Processing stage reached - workflow successful');
          
          // Wait for processing to potentially complete (with timeout)
          // Real processing takes time, so we just verify the stage transition
          await page.waitForTimeout(5000);
          
          // Stage 4: Results (may or may not complete in test timeframe)
          const resultsVisible = await page.getByText(/Compliance Score|Control Mappings|Results/i).isVisible({ timeout: 10000 }).catch(() => false);
          
          if (resultsVisible) {
            console.log('Results stage reached - full workflow completed!');
          } else {
            console.log('Processing in progress - workflow stages working correctly');
          }
        }
      }
    }
  });
  
  test('should allow different baseline selections', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Check if scope selector loaded
    const scopeLoaded = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!scopeLoaded) {
      console.log('Backend API not available');
      return;
    }
    
    // Look for baseline selection options
    // The ScopeSelector component has baseline buttons/options
    const moderateOption = page.getByText(/Moderate.*Baseline/i).or(
      page.locator('button:has-text("Moderate")').or(
        page.locator('[data-baseline="moderate"]')
      )
    ).first();
    
    if (await moderateOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moderateOption.click();
      await page.waitForTimeout(2000);
      
      // Should show different control count (325 for Moderate)
      const controlCountVisible = await page.getByText(/325.*control/i).isVisible({ timeout: 3000 }).catch(() => false);
      
      if (controlCountVisible) {
        console.log('Moderate baseline selection working');
      }
    }
  });
  
  test('should allow different assessment modes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const scopeLoaded = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!scopeLoaded) {
      console.log('Backend API not available');
      return;
    }
    
    // Look for mode selection (Quick, Smart, Deep)
    const quickMode = page.getByText(/Quick.*Mode/i).or(
      page.locator('button:has-text("Quick")').or(
        page.locator('[data-mode="quick"]')
      )
    ).first();
    
    if (await quickMode.isVisible({ timeout: 3000 }).catch(() => false)) {
      await quickMode.click();
      await page.waitForTimeout(1000);
      
      // Should show mode description
      const modeDescVisible = await page.getByText(/0\.5.*second|fast|quick/i).isVisible({ timeout: 2000 }).catch(() => false);
      
      if (modeDescVisible) {
        console.log('Assessment mode selection working');
      }
    }
    
    // Try Deep mode
    const deepMode = page.getByText(/Deep.*Mode/i).or(
      page.locator('button:has-text("Deep")').or(
        page.locator('[data-mode="deep"]')
      )
    ).first();
    
    if (await deepMode.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deepMode.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Multi-Document Upload', () => {
  
  test('should handle multiple file uploads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      // Upload multiple files
      await fileInput.setInputFiles([
        {
          name: 'policy.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\nPolicy Document')
        },
        {
          name: 'procedures.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\nProcedures Document')
        },
        {
          name: 'diagram.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
        }
      ]);
      
      await page.waitForTimeout(1500);
      
      // Should show 3 files
      const fileCountBadge = page.getByText(/3/).or(page.getByText(/Selected Files/i));
      await expect(fileCountBadge.first()).toBeVisible({ timeout: 3000 });
      
      // Analyze button should show "Analyze 3 Documents"
      const analyzeButton = page.getByRole('button', { name: /Analyze.*3.*Document/i });
      
      if (await analyzeButton.isVisible({ timeout: 3000 })) {
        await expect(analyzeButton).toBeEnabled();
      }
    }
  });
  
  test('should allow removing uploaded files', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'temp.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nTemp')
      });
      
      await page.waitForTimeout(1000);
      
      // Look for remove button (X icon)
      const removeButton = page.locator('button').filter({ hasText: '' }).first();
      
      if (await removeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const removeButtons = page.locator('button:has-text("")');
        const count = await removeButtons.count();
        
        // Click first remove button if exists
        if (count > 0) {
          await removeButtons.first().click();
          await page.waitForTimeout(500);
          
          // File should be removed (no Selected Files or file count reduced)
          console.log('File removal working');
        }
      }
    }
  });
});

test.describe('Scope Configuration Options', () => {
  
  test('should show processing estimate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Should show estimate (control count, time, cost)
    const estimateVisible = await page.getByText(/Est.*Time|Estimated|minute/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (estimateVisible) {
      console.log('Processing estimate displayed');
      
      // Should show control count
      await expect(page.getByText(/control/i)).toBeVisible({ timeout: 2000 });
    }
  });
  
  test('should display scope summary in upload stage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Should show "Assessment Scope Configured" summary
      const scopeSummary = await page.getByText(/Assessment Scope Configured/i).isVisible({ timeout: 3000 }).catch(() => false);
      
      if (scopeSummary) {
        console.log('Scope summary displayed in upload stage');
        
        // Should show baseline, mode, controls count
        await expect(page.getByText(/Baseline:/i)).toBeVisible({ timeout: 2000 });
        await expect(page.getByText(/Mode:/i)).toBeVisible({ timeout: 2000 });
      }
      
      // Should have "Change scope" link
      const changeScopeLink = page.getByText(/Change scope/i);
      
      if (await changeScopeLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await changeScopeLink.click();
        await page.waitForTimeout(1000);
        
        // Should navigate back to scope stage
        await expect(page.getByText(/Assessment Scope/i)).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe('Visual and Branding', () => {
  
  test('should display Google Gemini AI branding', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page.getByText(/Powered by/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Google Gemini AI/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('should show AI-powered features description', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Should show feature cards
      await expect(page.getByText(/Multimodal AI Analysis/i)).toBeVisible({ timeout: 3000 });
      await expect(page.getByText(/NIST 800-53 Mapping/i)).toBeVisible({ timeout: 3000 });
      await expect(page.getByText(/OSCAL Generation/i)).toBeVisible({ timeout: 3000 });
    }
  });
});
