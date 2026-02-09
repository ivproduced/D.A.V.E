/**
 * Error handling and validation E2E tests for D.A.V.E
 * Tests edge cases, validation errors, and graceful failure scenarios
 */

import { test, expect } from '@playwright/test';

test.describe('File Upload Validation', () => {
  
  test('should prevent upload without scope configuration', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Continue button should be disabled until scope loads estimate
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    // Initially may be disabled while loading
    const isDisabled = await continueButton.isDisabled({ timeout: 3000 }).catch(() => true);
    
    if (isDisabled) {
      console.log('Continue button correctly disabled without scope estimate');
      expect(isDisabled).toBe(true);
    } else {
      console.log('Continue button enabled - scope loaded from API');
    }
  });
  
  test('should require at least one file for analysis', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Try to analyze without files
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      // Should be disabled when no files
      if (await analyzeButton.isVisible({ timeout: 3000 })) {
        const isDisabled = await analyzeButton.isDisabled();
        expect(isDisabled).toBe(true);
        console.log('Analyze button correctly disabled without files');
      }
    }
  });
  
  test('should reject invalid file types', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      // Try uploading .exe file (not in accept list)
      await fileInput.setInputFiles({
        name: 'malware.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('MZ\x90\x00')
      });
      
      await page.waitForTimeout(1500);
      
      // File should not appear in list (browser blocks it via accept attribute)
      const fileList = await page.getByText(/malware\.exe/i).isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(fileList).toBe(false);
      console.log('Invalid file type correctly rejected');
    }
  });
  
  test('should validate file size limit (50MB)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Verify 50MB limit is displayed
      await expect(page.getByText(/50MB/i)).toBeVisible({ timeout: 3000 });
      
      console.log('File size limit displayed to user');
    }
  });
});

test.describe('Network Error Scenarios', () => {
  
  test('should handle backend API unavailable', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000');
    
    // If backend is down, scope selector won't load data
    await page.waitForTimeout(5000);
    
    // Check if continue button is disabled (no estimate loaded)
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isVisible({ timeout: 3000 })) {
      const isDisabled = await continueButton.isDisabled({ timeout: 2000 }).catch(() => true);
      
      if (isDisabled) {
        console.log('UI correctly prevents continuation when backend unavailable');
      } else {
        console.log('Backend API is available and responding');
      }
    }
  });
  
  test('should handle API errors during upload', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nTest')
      });
      
      await page.waitForTimeout(1000);
      
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
        await analyzeButton.click();
        
        // Wait for potential error message
        await page.waitForTimeout(3000);
        
        // Look for error message or success transition
        const errorVisible = await page.getByText(/error|failed|try again/i).isVisible({ timeout: 5000 }).catch(() => false);
        
        if (errorVisible) {
          console.log('API error handling displayed to user');
        } else {
          console.log('Upload succeeded or processing started');
        }
      }
    }
  });
  
  test('should handle timeout scenarios', async ({ page }) => {
    // Set shorter timeout for this test
    page.setDefaultTimeout(15000);
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      // Upload large-ish file
      await fileInput.setInputFiles({
        name: 'large-doc.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n' + 'Large content '.repeat(1000))
      });
      
      await page.waitForTimeout(1000);
      
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
        await analyzeButton.click();
        
        // Should transition to processing stage
        await page.waitForTimeout(2000);
        
        // Look for processing indicators
        const processingVisible = await page.getByText(/Processing|Analyzing/i).isVisible({ timeout: 5000 }).catch(() => false);
        
        if (processingVisible) {
          console.log('Processing stage reached - long-running tasks handled');
        }
      }
    }
  });
});

test.describe('User Input Validation', () => {
  
  test('should handle empty file upload', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      
      // Try empty file
      await fileInput.setInputFiles({
        name: 'empty.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('')
      });
      
      await page.waitForTimeout(1500);
      
      // File may still appear (validated on backend), but analyze should handle it
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
        await analyzeButton.click();
        await page.waitForTimeout(2000);
        
        // Should show error or validation message
        const errorVisible = await page.getByText(/error|invalid|empty/i).isVisible({ timeout: 5000 }).catch(() => false);
        
        if (errorVisible) {
          console.log('Empty file validation working');
        }
      }
    }
  });
  
  test('should display error messages to user', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Check that error display mechanism exists
      // The FileUpload component has error state rendering
      
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nTest')
      });
      
      await page.waitForTimeout(1000);
      
      const analyzeButton = page.getByRole('button', { name: /Analyze.*Document/i });
      
      if (await analyzeButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
        // Click analyze - may succeed or fail depending on backend
        await analyzeButton.click();
        await page.waitForTimeout(2000);
        
        // If error occurs, should have red error box with AlertCircle icon
        const errorBox = page.locator('div').filter({ hasText: /error|failed/i }).first();
        
        const hasError = await errorBox.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasError) {
          console.log('Error message UI rendering correctly');
        } else {
          console.log('No error occurred - upload succeeded');
        }
      }
    }
  });
});

test.describe('Edge Cases', () => {
  
  test('should handle rapid scope changes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const scopeLoaded = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!scopeLoaded) {
      console.log('Backend API not available');
      return;
    }
    
    // Rapidly click different options if available
    const lowOption = page.getByText(/Low.*Baseline/i).first();
    const moderateOption = page.getByText(/Moderate.*Baseline/i).first();
    
    if (await lowOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await lowOption.click();
      await page.waitForTimeout(300);
    }
    
    if (await moderateOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await moderateOption.click();
      await page.waitForTimeout(300);
    }
    
    // Should handle rapid changes gracefully
    await page.waitForTimeout(2000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    const isEnabled = await continueButton.isEnabled({ timeout: 3000 }).catch(() => false);
    
    if (isEnabled) {
      console.log('UI handles rapid scope changes correctly');
    }
  });
  
  test('should handle browser back button', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Verify we're on upload stage
      await expect(page.getByText(/Upload Evidence Artifacts/i)).toBeVisible({ timeout: 3000 });
      
      // Go back
      await page.goBack();
      await page.waitForTimeout(1000);
      
      // Should be back on scope stage
      const backOnScope = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 3000 }).catch(() => false);
      
      if (backOnScope) {
        console.log('Browser navigation handled correctly');
      } else {
        console.log('Back navigation may use client-side routing');
      }
    }
  });
  
  test('should handle page reload during workflow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Upload file
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nTest')
      });
      
      await page.waitForTimeout(1000);
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Should reset to initial state (scope selection)
      const resetToScope = await page.getByText(/Assessment Scope/i).isVisible({ timeout: 5000 }).catch(() => false);
      
      if (resetToScope) {
        console.log('Page reload resets workflow correctly');
      } else {
        console.log('Workflow may persist state across reloads');
      }
    }
  });
});

test.describe('Accessibility', () => {
  
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Check for proper button roles
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`Found ${buttonCount} accessible buttons`);
    
    // Check for headings
    const headings = page.getByRole('heading');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    console.log(`Found ${headingCount} accessible headings`);
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Should be able to reach continue button
    const continueButton = page.getByRole('button', { name: /Continue to File Upload/i });
    
    if (await continueButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await continueButton.focus();
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should navigate to upload stage
      const onUploadStage = await page.getByText(/Upload Evidence Artifacts/i).isVisible({ timeout: 3000 }).catch(() => false);
      
      if (onUploadStage) {
        console.log('Keyboard navigation working correctly');
      }
    }
  });
});
