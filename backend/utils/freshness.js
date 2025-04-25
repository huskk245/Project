import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const detectFreshness = async (imagePath) => {
  try {
    console.log('Starting freshness detection...');

    // Default values in case of failure
    const defaultResult = {
      freshnessScore: 100,
      isFresh: true
    };

    // Try to find Python in common locations
    const pythonPaths = [
      'python',
      'python3',
      'C:\\Python310\\python.exe',
      'C:\\Python39\\python.exe',
      'C:\\Python38\\python.exe',
      'C:\\Python37\\python.exe',
      process.env.PYTHON_PATH // Allow configuration via environment variable
    ];

    // Find first working Python interpreter
    let pythonPath = 'python';
    for (const path of pythonPaths) {
      if (path) {
        try {
          const testProcess = spawn(path, ['--version']);
          await new Promise((resolve, reject) => {
            testProcess.on('exit', (code) => {
              if (code === 0) {
                pythonPath = path;
                resolve();
              } else {
                reject();
              }
            });
            testProcess.on('error', reject);
          });
          break;
        } catch (err) {
          continue;
        }
      }
    }

    console.log('Python interpreter:', pythonPath);

    const scriptPath = path.join(__dirname, '..', '..', 'python', 'detect_freshness.py');
    console.log('Script path:', scriptPath);
    console.log('Image path:', imagePath);

    return new Promise((resolve, reject) => {
      try {
        const pythonProcess = spawn(pythonPath, [scriptPath, imagePath]);
        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          console.log('Python process exited with code:', code);
          console.log('Raw stdout:', stdout);
          console.log('Raw stderr:', stderr);

          if (code !== 0) {
            console.warn('Freshness detection failed, using default values');
            resolve(defaultResult);
            return;
          }

          try {
            console.log('Attempting to parse Python output:', stdout);
            const result = JSON.parse(stdout);
            console.log('Parsed Python result:', result);
            console.log('Confidence value:', result.confidence);

            const finalResult = {
              freshnessScore: result.confidence || defaultResult.freshnessScore,
              isFresh: result.is_fresh !== undefined ? result.is_fresh : defaultResult.isFresh,
              predictedLabel: result.predicted_label || 'Unknown'
            };

            console.log('Final result being sent to frontend:', finalResult);
            resolve(finalResult);
          } catch (error) {
            console.warn('Failed to parse Python output:', error);
            console.warn('Raw output that failed to parse:', stdout);
            resolve(defaultResult);
          }
        });

        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python process:', error);
          resolve(defaultResult);
        });
      } catch (error) {
        console.error('Error in freshness detection:', error);
        resolve(defaultResult);
      }
    });
  } catch (error) {
    console.error('Top-level error in freshness detection:', error);
    return {
      freshnessScore: 100,
      isFresh: true
    };
  }
}; 