const os = require('os');
const fetch = require('node-fetch');
const exec = require('child_process').exec;  

exports.getEmails = async (request, response) => {
    console.log("a");
    console.log(os.tmpdir());
    const username = request.query.username;
    if (!username) {
        response.send("invalid username");
        return;
    }
    console.log("username:", username);
    // get user's github
    // get one of their repo urls (github api???)
    try {
        const repos = await fetch(`https://api.github.com/users/${username}/repos`);
        const json = await repos.json();
        console.log(json[0]);
        const url = json[0]['html_url'];
        console.log("repo url", url);
        let urls = [];
        for (let i = 0; i<json.length; i++) {
            urls.push(json[i]['html_url']);
        }
        console.log("all urls", urls);
        // pass that url into the shell script
        
        // todo: maybe use async version instead, maybe run multiple in parallel with diff urls
        exec(`./get_emails.sh ${url} ${os.tmpdir()}`, (err, stdout, stderr) => {  
            if (err) {  
                console.error(err);  
                return;  
            }  
            console.log(stdout);
            let emails = stdout.split("\n").filter(e => !e.endsWith("@users.noreply.github.com") && e != "");
            console.log(emails);

            // send the outputted emails back to the client
            return response.send(emails);
        });
    } catch(error) {
        console.log(error);
        response.status(500).send(error);
        return;
    }
};