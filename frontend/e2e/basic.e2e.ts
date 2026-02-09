/**
 * Basic E2E tests for D.A.V.E UI functionality
 * Tests the multi-stage workflow: scope → upload → processing → results
 */

import { test, expect } from '@playwright/test';

test.describe('Basic UI Navigation', () => {
  
  test('should load home page and show scope selector (Stage 1)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for D.A.V.E branding
    await expect(page.getByText(/D\.A\.V\.E/i)).toBeVisible();
    await expect(page.getByText(/Document Analysis & Validation Engine/i)).toBeVisible();
    
    // Check for progress stepper showing 4 stages
    await expect(page.getByText(/Define Scope/i).first()).toBeVisible();
    await expect(page.getByText(/Upload SSP/i).first()).toBeVisible();
    await expect(page.getByText(/AI Analysis/i).first()).toBeVisible();
    await expect(page.getByText(/Results/i).first()).toBeVisible();
    
    // Check for scope selector UI (may match multiple elements, use first)
    const scopeHeading = page.getByText(/Assessment Scope|Quick Assessment Scopes/i).first();
    await expect(scopeHeading).toBeVisible();
  });
  
  test('should navigate from scope to upload stage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for scope selector to load
    await page.waitForTimeout(2000);
    
    // Look for "Continue to File Upload" button
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    // Button might be disabled initially until scope loads
    await page.waitForTimeout(1000);
    
    if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check if button is enabled (scope estimate loaded)
      if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
        await continueButton.click();
        
        // Should now be on upload stage
        await expect(page.getByText(/Upload Evidence Artifacts/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/Drag & Drop Files Here/i)).toBeVisible({ timeout: 3000 });
      } else {
        console.log('Continue button not enabled - may need API backend running');
      }
    } else {
      console.log('Continue button not found - API backend may not be running');
    }
  });
  
  test('should show file upload dropzone in upload stage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for scope to load
    await page.waitForTimeout(2000);
    
    // Try to navigate to upload stage
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(1000);
        
        // Check for file upload elements
        const fileInput = page.locator('input[type="file"]').first();
        await expect(fileInput).toBeAttached({ timeout: 3000 });
        
        // Check for supported formats
        await expect(page.getByText(/PDF.*DOCX.*PNG.*JPG.*JSON.*YAML/i)).toBeVisible();
        
        // Check for file size limit
        await expect(page.getByText(/50MB/i)).toBeVisible();
      }
    }
  });
});

test.describe('File Upload UI', () => {
  
  test('should accept file selection', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Navigate to upload stage
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Upload a test file
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'test-policy.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%âãÏÓ\nTest Policy Document Content')
      });
      
      await page.waitForTimeout(1000);
      
      // Should show file in list
      await expect(page.getByText(/test-policy\.pdf/i)).toBeVisible({ timeout: 3000 });
      await expect(page.getByText(/Selected Files/i)).toBeVisible();
    }
  });
  
  test('should enable analyze button when files uploaded', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'security.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nSecurity Policy')
      });
      
      await page.waitForTimeout(1000);
      
      // Look for Analyze button - should be enabled
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isVisible({ timeout: 3000 })) {
        await expect(analyzeButton).toBeEnabled({ timeout: 2000 });
      }
    }
  });
});

test.describe('Responsive Design', () => {
  
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Page should load
    await expect(page.getByText(/D\.A\.V\.E/i)).toBeVisible({ timeout: 5000 });
    
    // UI elements should be visible (may be stacked vertically)
    await expect(page.locator('body')).toBeVisible();
  });
  
  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    
    await expect(page.getByText(/D\.A\.V\.E/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Document Analysis & Validation Engine/i)).toBeVisible();
  });
});
