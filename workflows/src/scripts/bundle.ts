import { bundleWorkflowCode } from '@temporalio/worker';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';

async function bundleAllScenarios() {
  const workflowsDir = path.join(__dirname, '..');
  
  // Read all files in the workflows directory
  const files = await readdir(workflowsDir);
  
  // Filter for scenario files
  const scenarioFiles = files.filter(file => file.match(/^scenario-\d+\.ts$/));
  
  console.log(`Found ${scenarioFiles.length} scenario files:`, scenarioFiles);
  
  // Bundle each scenario file
  for (const scenarioFile of scenarioFiles) {
    try {
      const scenarioPath = path.join(workflowsDir, scenarioFile);
      const { code } = await bundleWorkflowCode({
        workflowsPath: require.resolve(scenarioPath),
      });
      
      // Generate output filename: scenario-1.ts -> scenario-1-bundle.js
      const outputFileName = scenarioFile.replace('.ts', '-bundle.js');
      const outputPath = path.join(workflowsDir, outputFileName);
      
      await writeFile(outputPath, code);
      console.log(`✓ Bundle written to ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to bundle ${scenarioFile}:`, error);
    }
  }
}

bundleAllScenarios().catch((err) => {
  console.error(err);
  process.exit(1);
});