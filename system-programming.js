const fs = require('fs');
const path = require("path");

const diskUsage = (diskPath, result) => {
  const target = path.join(__dirname, diskPath)

  const files = fs.readdirSync(target);

  //listing all files using forEach
  files.forEach((file) => {
    const destination = target + '/'+ file
    const isDirectory = fs.existsSync(destination) && fs.statSync(destination).isDirectory()

    if (isDirectory) {
      diskUsage(diskPath + '/' + file, result)
    } else {
      const {size} = fs.statSync(destination);
      result.push({[destination]: size})
    }
  });
  return {files:result}
}


console.log(diskUsage('', []))