/**
 *
 * ProjectName：getFiles
 * Description：
 * Created by qimuyunduan on 2017/7/23 .
 * Revise person：qimuyunduan
 * Revise Time：2017/7/23 上午10:00
 * @version
 *
 */

/*
*
* 使用方法
* 1.npm install
* 2.node index.js
* 注意node版本应在7.0以上输入 node -v 查看本机node版本
* */

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const fs = require('fs');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
const path = require('path');

const config = {
    DBUrl:"mongodb://127.0.0.1:27017/test",
    connectOption:{
        useMongoClient: true
    },
    acceptFileType:['png','jpeg','jpg',]
};

const handleFiles = (files,gfs) => {

    let count = 0;
    let sum = files.length;

    for(let file of files) {

        let splitStr = file.filename.split('.');
        let fileType = splitStr[splitStr.length-1];
        let splitString = file.filename.split('/');
        let filename = splitString[splitString.length-1];
        if(config.acceptFileType.indexOf(fileType) > -1){
            let readStream = gfs.createReadStream({_id:file._id});
            let writeStream = fs.createWriteStream(path.resolve(__dirname,'files/',filename));
            readStream.pipe(writeStream);

            writeStream.on('finish',()=>{
                console.log(`第${++count}个文件处理完毕`);
                if(count === sum){
                    console.log('所有文件处理完毕,文件存放在files目录中');
                    mongoose.disconnect();
                }
            });

        }
    }
};
mongoose.connect(config.DBUrl,config.connectOption)
    .then((con) => {

        let gfs = Grid(con.db);
        gfs.files.find().toArray((err,files)=>{
            if(!err){
               handleFiles(files,gfs);
            }
        })
    })
    .catch(() => {
        console.log("connection is lost");
    });
        
