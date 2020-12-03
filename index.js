const convert = require('fbx2gltf');
const path = require('path')
const fs = require('fs')
let files = fs.readdirSync('./path')

rmdir = (filePath, callback) => {
    // 先判断当前filePath的类型(文件还是文件夹,如果是文件直接删除, 如果是文件夹, 去取当前文件夹下的内容, 拿到每一个递归)
    fs.stat(filePath, function(err, stat) {
      if(err) return console.log(err)
      if(stat.isFile()) {
        fs.unlink(filePath, callback)
      }else {
        fs.readdir(filePath, function(err, data) {
          if(err) return console.log(err)
          let dirs = data.map(dir => path.join(filePath, dir))
          let index = 0
          !(function next() {
            // 此处递归删除掉所有子文件 后删除当前 文件夹
            if(index === dirs.length) {
              fs.rmdir(filePath, callback)
            }else {
              rmdir(dirs[index++],next)
            }
          })()
        })
      }
    })
  }

fs.exists(path.join(__dirname,'dist'),function(exist){
    if(exist){
        rmdir('./dist',()=>{
            console.log('删除原来dist文件完成')
            fs.mkdir('./dist',()=>{
                console.log('创建新dist文件')
                syncFBX2GLTF(0)
            })
        })
    }else{
        fs.mkdir('./dist',()=>{
            console.log('创建dist文件')
            syncFBX2GLTF(0)
        })
    }
})

syncFBX2GLTF = (index) => {
    let from =path.join(__dirname,  `/path/${files[index]}`)
    
    if(from.indexOf('.fbx') == -1){
        console.log(`跳过${from}，非fbx文件`)
        index += 1 
        if(index < files.length){
            syncFBX2GLTF(index)
        }
        return
    }
    let to =path.join(__dirname, `/dist/${files[index]}`.replace(/.fbx/,".glb"))
    convert(from,to, ['--khr-materials-unlit']).then(
        destPath => {
            console.log('成功' + from)
            index += 1 
            if(index < files.length){
                syncFBX2GLTF(index)
            }
        },
        error => {
            console.log('失败' + to,`原因`+error)
            index += 1 
            if(index < files.length){
                syncFBX2GLTF(index)
            }
    })
}





// convert('path/some.fbx', 'path/target.glb', ['--khr-materials-unlit']).then(
//     destPath => {
//         console.log(destPath)
//     },
//     error => {
//         console.log(error)
//     }
// );