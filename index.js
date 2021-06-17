const os = require('os');
const fetch = require('node-fetch');
const exec = require('child_process').exec;

exports.getEmails = async (request, response) => {
    // only allow cors requests from my extension
    response.set('Access-Control-Allow-Origin', 'chrome-extension://ppcegaekdbgcgbapfdcjbhednhmgcjnk');

    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        return response.status(204).send('');
    }

    console.log(os.tmpdir());
    const username = request.query.username;
    const repo = request.query.repo;
    if (!username) {
        response.send("invalid username");
        return;
    }
    console.log("username:", username);
    console.log("repo name:", repo);
    // get user's github
    // get one of their repo urls (github api???)
    try {
        let url;
        if (repo != "") { // if user called script from a specific repo page, get the emails for that repo
            url = `https://github.com/${username}/${repo}`;
        } else {
            // fetch the user's repos from api
            const repos = await fetch(`https://api.github.com/users/${username}/repos`);
            const json = await repos.json();
            url = json[0]['html_url'];
            console.log("repo url", url);
            let urls = [];
            for (let i = 0; i<json.length; i++) {
                urls.push(json[i]['html_url']);
            }
            console.log("all urls", urls);
        }
        // pass that url into the shell script
        // todo: maybe use async version instead, maybe run multiple in parallel with diff urls
        exec(`./get_emails.sh ${url} ${os.tmpdir()}`, (err, stdout, stderr) => {  
            if (err) {  
                console.error(err);
                response.status(500).send(error);  
                return;  
            }  
            console.log(stdout);
            let emails = stdout.split("\n").filter(e => {
                console.log(e, e.endsWith("@users.noreply.github.com"), e != "");
                return !e.endsWith("@users.noreply.github.com") && e != "";
            });
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