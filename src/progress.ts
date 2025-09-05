import { Readable } from "stream";
import { verbose } from "./verbose.js";

export function showProgress(stream: Readable) {
  let bytes = 0;
  let i = 0;
  stream.on("data", (data) => {
    bytes += data.length;
    if (i++ % 1000 !== 0) return;
    process.stdout.clearLine?.(0);
    process.stdout.write(`\rDownloaded ${formatBytes(bytes)}`);
  });
}

function formatBytes(numBytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (numBytes > 1024 && unitIndex < units.length) {
    numBytes /= 1024;
    unitIndex++;
  }
  return `${numBytes.toFixed(2)} ${units[unitIndex]}`;
}

export function showPercentage(percentage: number, currentTask?: string) {
  const percentageStr = Math.round(percentage * 100);
  const taskInfo = currentTask ? ` - ${currentTask}` : '';
  
  if (!verbose.enabled) {
    process.stdout.clearLine?.(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`🔄 Processing: ${percentageStr}%${taskInfo}`);
  } else {
    verbose.log(`Processing: ${percentageStr}%${taskInfo}`);
  }
  if (percentage === 1) {
    process.stdout.write("\n");
  }
}

export function showFileProgress(currentFile: number, totalFiles: number, fileName: string, task: string = "Processing") {
  const percentage = Math.round((currentFile / totalFiles) * 100);
  const fileInfo = fileName.length > 30 ? `...${fileName.slice(-27)}` : fileName;
  
  if (!verbose.enabled) {
    process.stdout.clearLine?.(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`📁 ${task}: ${currentFile}/${totalFiles} (${percentage}%) - ${fileInfo}`);
  } else {
    verbose.log(`${task}: ${currentFile}/${totalFiles} (${percentage}%) - ${fileInfo}`);
  }
}
