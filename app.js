import { readFile, writeFile } from "fs/promises";
import { createServer } from "http";
import crypto from "crypto";
import path from "path";

// const mimeTypes = {
//     '.html': 'text/html',
//     '.css': 'text/css',
//     '.js': 'text/javascript',
//     '.json': 'application/json',
//     '.png': 'image/png',
//     '.jpg': 'image/jpeg',
//     '.gif': 'image/gif',
//     '.svg': 'image/svg+xml',
//     '.wav': 'audio/wav',
//   };


const fileServe = async (res,fileName, contentType) => {    
    try {                 
        const data = await readFile(path.join("public", fileName));                    
        res.writeHead(200, {"Content-Type": contentType });
        res.end(data);              
         
     } catch (error){
         res.writeHead(404, {"Content-Type": "text/plain"});                    
         res.end("page note found");
     }

}


// get link file data
const DATA_FILE = path.join("data","links.json");
const loadLinks = async () => {

    try {
        const data = await readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
        
    } catch (error) {
        if(error.code === "ENOENT"){
            writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
    }
}

// save data
const saveLinks = async (links) => {
    writeFile(DATA_FILE, JSON.stringify(links));    
}



const server = createServer( async (req, res)=>{
        console.log(req.url)

        if(req.method === "GET"){

            if(req.url === "/"){
                fileServe(res, "index.html" , "text/html");

            }else if(req.url === "/style.css"){
                fileServe(res, "style.css" , "text/css");  

            }else if(req.url === "/favicon.ico"){
                fileServe(res, "favicon.ico" , "image/png");                  
            } else if(req.url === "/links"){
                const links = await loadLinks();
                res.writeHead(200, {"Content-Type" : "application/json"});
                return res.end(JSON.stringify(links));
            }else{
                const links = await loadLinks();
                const shortCode = req.url.slice(1);
                console.log(links[shortCode]);
                if(links[shortCode]){
                    res.writeHead(302, {location: links[shortCode]});
                    return res.end();

                }
            }
        }

        // when api request for post in this server

        if( req.method === "POST" && req.url === "/shorten"){


            const links = await loadLinks();

            let body = "";

            req.on("data", (chunk) => {
                body += chunk;
            })

            req.on("end", async () => {

                console.log("body datatata", body);
                
                const { urlLink, shortCode} = JSON.parse(body);

                console.log(urlLink, "unlink dattttttaxx");
                console.log(shortCode, "unlink dattttttaxx");


                 // If url not input 
                if(!urlLink){
                    res.writeHead(400, {"content-type" : "text/plain"});
                return  res.end("URL is requird");
                }

                // if short code not get
                const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

                console.log("final short code --= ",  links);
                
                if( links[finalShortCode] ){

                    res.writeHead(400, {"Content-Type" : "text/plain"});
                    return res.end("SHort code already exists, PLz Choose another one");
                }

                links[finalShortCode] = urlLink;

                
                await saveLinks(links);

                res.writeHead(200, {"Content-Type" : "application/json"});
                res.end(JSON.stringify({success: true, shortCode: finalShortCode}));

            })

        }
});



const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running in ${PORT}`);
})

