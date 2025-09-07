import { test, expect } from '@playwright/test';

test('Live broadcast page loads correctly', async ({ page }) => {
  // Navigate to the live broadcast page
  await page.goto('/live');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/Live Broadcast - AKY Media Center/);
  
  // Check for the loading state
  await expect(page.locator('text=Connecting to Live Stream')).toBeVisible();
  
  // Wait for the broadcast status check
  await page.waitForTimeout(6000);
  
  // Check if we see the "Stream Offline" message or the join screen
  const offlineMessage = page.locator('text=Stream Offline');
  const joinScreen = page.locator('text=Join Live Stream');
  
  // Either message should be visible
  const isOfflineVisible = await offlineMessage.isVisible();
  const isJoinVisible = await joinScreen.isVisible();
  
  expect(isOfflineVisible || isJoinVisible).toBeTruthy();
});

test('Live broadcast with ID page loads correctly', async ({ page }) => {
  // Navigate to a specific broadcast ID page
  await page.goto('/live/test-broadcast-id');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/Live Broadcast test-broadcast-id - AKY Media Center/);
  
  // Check for the loading state
  await expect(page.locator('text=Checking broadcast')).toBeVisible();
  
  // Wait for the broadcast status check
  await page.waitForTimeout(6000);
  
  // Check if we see the "Broadcast Not Found" message
  await expect(page.locator('text=Broadcast Not Found')).toBeVisible();
});