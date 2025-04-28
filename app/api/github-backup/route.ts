import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Directory for model storage
const MODEL_DIR = path.join(process.cwd(), "Qmoi")
const BACKUP_DIR = path.join(process.cwd(), "backup")

export async function POST(request: Request) {
  try {
    const { githubToken, repoName } = await request.json()

    if (!githubToken || !repoName) {
      return NextResponse.json({
        success: false,
        message: "GitHub token and repository name are required",
      })
    }

    // Create a script to push to GitHub
    const backupScriptPath = path.join(BACKUP_DIR, "github-backup.js")
    const backupScript = `
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// GitHub credentials and repo info
const GITHUB_TOKEN = '${githubToken}';
const REPO_NAME = '${repoName}';
const MODEL_DIR = '${MODEL_DIR.replace(/\\/g, "\\\\")}';
const BACKUP_DIR = '${BACKUP_DIR.replace(/\\/g, "\\\\")}';

// Create a timestamp for the backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

try {
  // Set up Git config
  console.log('Setting up Git configuration...');
  execSync('git config --global user.name "Alpha AI"');
  execSync('git config --global user.email "alpha-ai@example.com"');
  
  // Check if the repo directory exists
  const repoDir = path.join(BACKUP_DIR, 'github-repo');
  if (!fs.existsSync(repoDir)) {
    console.log('Cloning repository...');
    fs.mkdirSync(repoDir, { recursive: true });
    execSync(\`git clone https://\${GITHUB_TOKEN}@github.com/\${REPO_NAME}.git \${repoDir}\`);
  } else {
    console.log('Pulling latest changes...');
    execSync('git pull', { cwd: repoDir });
  }
  
  // Create Qmoi directory in the repo if it doesn't exist
  const repoQmoiDir = path.join(repoDir, 'Qmoi');
  if (!fs.existsSync(repoQmoiDir)) {
    fs.mkdirSync(repoQmoiDir, { recursive: true });
  }
  
  // Copy model files to the repo
  console.log('Copying model files...');
  if (fs.existsSync(MODEL_DIR)) {
    // Function to copy files recursively
    function copyFilesRecursively(sourceDir, targetDir) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const items = fs.readdirSync(sourceDir);
      
      for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
          copyFilesRecursively(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
    
    copyFilesRecursively(MODEL_DIR, repoQmoiDir);
  }
  
  // Create a backup info file
  const backupInfo = {
    timestamp: timestamp,
    backupDate: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(repoQmoiDir, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  // Commit and push changes
  console.log('Committing and pushing changes...');
  execSync('git add .', { cwd: repoDir });
  execSync(\`git commit -m "Automatic backup \${timestamp}"\`, { cwd: repoDir });
  execSync('git push', { cwd: repoDir });
  
  console.log('GitHub backup completed successfully!');
  
  // Update status file
  fs.writeFileSync(
    path.join(BACKUP_DIR, 'github-status.json'),
    JSON.stringify({
      lastBackupTime: new Date().toISOString(),
      repository: REPO_NAME,
      status: 'success'
    }, null, 2)
  );
} catch (error) {
  console.error('GitHub backup failed:', error);
  
  // Update status file with error
  fs.writeFileSync(
    path.join(BACKUP_DIR, 'github-status.json'),
    JSON.stringify({
      lastBackupTime: new Date().toISOString(),
      repository: REPO_NAME,
      status: 'failed',
      error: error.message
    }, null, 2)
  );
  
  process.exit(1);
}
    `

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    fs.writeFileSync(backupScriptPath, backupScript)

    // Execute the backup script
    try {
      execAsync(`node ${backupScriptPath}`)
      console.log("Started GitHub backup script")
    } catch (error) {
      console.error("Failed to start GitHub backup script:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to start GitHub backup",
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return NextResponse.json({
      success: true,
      message: "GitHub backup initiated",
      repository: repoName,
    })
  } catch (error) {
    console.error("Error processing GitHub backup request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing GitHub backup request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function GET() {
  try {
    const statusPath = path.join(BACKUP_DIR, "github-status.json")
    if (fs.existsSync(statusPath)) {
      const statusData = JSON.parse(fs.readFileSync(statusPath, "utf8"))
      return NextResponse.json(statusData)
    }

    return NextResponse.json({
      lastBackupTime: null,
      repository: null,
      status: "never_run",
    })
  } catch (error) {
    console.error("Error fetching GitHub backup status:", error)
    return NextResponse.json({
      success: false,
      message: "Error fetching GitHub backup status",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
