const YAML = require('yamljs');
const fs = require('fs-extra')
const querystring = require('querystring');
const cbt = require('cbt_tunnels');
const r = require('request');
const request = require('request-promise');
const AdmZip = require('adm-zip');

if (!process.argv[2]) {
    console.error('No config file specified.');
    process.exit(1);
}

const config = YAML.load(process.argv[2]);

console.log('Browsers:', Object.keys(config.test_devices).join(', '));

const apiUrl = `https://${config.cbt.username}:${config.cbt.auth_key}@crossbrowsertesting.com/api/v3/screenshots`;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(ms) {
    await timeout(ms);
}

async function getBrowserList() {
    let res;

    try {
        res = await request({ uri: apiUrl + '/browsers' });
        JSON.parse(res).forEach(e => {
            console.log(e.api_name);
            console.log('Browsers:');
            e.browsers.forEach( b => process.stdout.write(b.api_name + ' '));
            console.log('\nResolutions:');
            e.resolutions.forEach( r => process.stdout.write(r.name + ' '));
            console.log('\n\n---\n');
        });
    } catch (err) {
        console.log(err);
    }
}

function download(uri, path) {

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path);
        file.on('open', () => {
            r
                .get(uri)
                .on('error', (err) => reject(err))
                .pipe(file)
                .on('finish', () => resolve());
        });
    });
}

async function takeSnapshot(pageUrl, pageName, variant, browsers, prefix_to_res, snapshots_folder) {
    let res;

    try {
        res = await request.post({
            uri: apiUrl + '?' + querystring.stringify({
                url: pageUrl,
                check_url: false,
                browsers
            })
        });
    } catch(err) {
        console.log(err);
        return;
    }

    const testId = JSON.parse(res).screenshot_test_id;

    console.log(`Taking snapshots: ${pageName} on ${variant} (${testId})...`);

    let testInfo;
    let elapsedTime = 0;

    while (true) {
        await sleep(1000);
        elapsedTime++;
        // process.stdout.write('.');

        let res;

        try {
            res = await request({ uri: apiUrl + '/' + testId });
        } catch(err) {
            console.log(err);
            continue;
        }

        testInfo = JSON.parse(res).versions[0];

        if (!testInfo.active) {
            break;
        }
    }

    const zipFileName = 'cbt_' + pageName + '_' + variant + '.zip';
    const sectionFolder = snapshots_folder + '/' + pageName;

    console.log(`${elapsedTime}s. ${testInfo.download_results_zip_public_url} -> ${zipFileName} -> ${sectionFolder}`);

    await download(testInfo.download_results_zip_public_url, zipFileName);

    const zip = new AdmZip(zipFileName);
    const entries = zip.getEntries();

    fs.ensureDirSync(sectionFolder);

    entries.forEach(zipEntry => {
        if (zipEntry.entryName.endsWith('_chromeless.png')) {

            zip.extractEntryTo(zipEntry.entryName, sectionFolder);

            fs.renameSync(
                sectionFolder + '/' + zipEntry.entryName,
                sectionFolder +
                '/' +
                zipEntry.entryName
                    .replace(
                        new RegExp([...prefix_to_res.keys()].join('|')),
                        match => prefix_to_res.get(match) + '_' + match
                    )
                    .replace('_chromeless', '_' + variant)
            );
        }
    });

    // fs.removeSync('snapshots.zip');
}

const prefix_to_res = new Map();

for (let device in config.test_devices) {
    if (config.test_devices.hasOwnProperty(device)) {
        prefix_to_res.set(config.test_devices[device].prefix, config.test_devices[device].resolution);
    }
}

cbt.start({username: config.cbt.username, authkey: config.cbt.auth_key}, async (err) => {
    if (err) {
        return console.error(err);
    }

    const browsers = Object.keys(config.test_devices);

    fs.removeSync(config.directory);

    for (let section of config.paths) {
        await takeSnapshot(config.domains.stage + '/' + section, section, 'stage', browsers, prefix_to_res, config.directory);
        await takeSnapshot(config.domains.prod + '/' + section, section, 'prod', browsers, prefix_to_res, config.directory);
    }

    // await getBrowserList();
    cbt.stop();
});
