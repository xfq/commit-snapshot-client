//#region const

const GITHUB_API_URL = 'https://api.github.com';

/**
Matches a GitHub repo URL.

Captures:
1.  Username
2.  Repo
3.  Ref
4.  File name

**/
const REGEX_REPO_URL = /^https?:\/\/github\.com\/(.+?)\/(.+?)\/(?!releases|commit\/)(?:(?:blob|raw)\/)?(.+?)\/(.+)/i;

/**
Matches a GitHub commit URL.

Captures:
1.  Username
2.  Repo
3.  Hash

**/
const REGEX_COMMIT_URL = /^https?:\/\/github\.com\/(.+?)\/(.+?)\/(?:commit\/)(.+)/i;

/**
Matches a spec URL (on GitHub).

Captures:
1.  Username
2.  Repo

**/
const REGEX_SPEC_URL_GITHUB = /^https?:\/\/(.+?)\.github\.io\/([^\/]+)\/?/i;

const MASTER_TO_GH_PAGES = ['w3c/IndexedDB', 'w3c/IntersectionObserver', 'w3c/longtasks',
'w3c/device-memory'
];

const GH_PAGES = ['w3c/payment-request',
'w3c/manifest', 'w3c/clreq',
'w3c/navigation-timing', 'w3c/resource-timing',
'w3c/hr-time'
];

const FILE_NOT_INDEX_HTML = ['w3c/wcag21'];

// TODO: Add css-houdini-drafts and fxtf-drafts support
const CSSWG_DRAFTS = ['w3c/csswg-drafts'];

//#endregion

//#region init

let inputUrl = document.getElementById('url');
let result = document.getElementById('result');

let resultUrl = document.createElement('span');
resultUrl.id = 'result-url';

let sk = document.createElement('div');
sk.classList.add('sk-wave');
sk.innerHTML = '<div class="sk-rect sk-rect1"></div> <div class="sk-rect sk-rect2"></div> <div class="sk-rect sk-rect3"></div> <div class="sk-rect sk-rect4"></div> <div class="sk-rect sk-rect5"></div>';

let copyButton = document.createElement('button');
copyButton.classList.add('snapshot-copy-button');
copyButton.dataset.clipboardTarget = '#result-url';
// copyButton.setAttribute('title', 'Copy Snapshot URL');
copyButton.setAttribute('disabled', '');
copyButton.innerHTML = 'Copy';

new Clipboard('.snapshot-copy-button');

// if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
//     copyButton.style.display = 'inline-block';
// }

inputUrl.addEventListener('input', getSnapshot);

getSnapshot();

//#endregion

//#region format functions

function formatCommitUrl(url) {
    let matches = url.match(REGEX_COMMIT_URL);

    let apiUrl = `${GITHUB_API_URL}/repos/${matches[1]}/${matches[2]}/commits/${matches[3]}`;

    result.appendChild(sk);

    fetch(apiUrl)
        .then(res => {
            if (!res.ok) {
                console.error('Failed to fetch the commit from GitHub API');
                return;
            }

            return res.json();
        })

        .then(data => {
            let r = getSpecUrl(url, data);

            // resultUrl.innerHTML = '<a href="' + r + '">' + r + '</a>';
            // result.appendChild(resultUrl);
            // result.appendChild(copyButton);
            // setValid();
        });
}

function formatRepoUrl(url) {
    let matches = url.match(REGEX_REPO_URL);

    let apiUrl = `${GITHUB_API_URL}/repos/${matches[1]}/${matches[2]}/commits/${matches[3]}`;

    result.appendChild(sk);

    fetch(apiUrl)
        .then(res => {
            if (!res.ok) {
                console.error('Failed to fetch latest repo commit from GitHub API');
                return;
            }

            return res.json();
        })

        .then(data => {
            let ref = data && data.sha ?
                data.sha.slice(0, 8) :
                matches[3];

            let r = url.replace(REGEX_REPO_URL, `https://rawgit.com/$1/$2/${ref}/$4`);

            sk.remove();

            resultUrl.innerHTML = '<a href="' + r + '">' + r + '</a>';
            result.appendChild(resultUrl);
            result.appendChild(copyButton);
            setValid();
        });
}

function formatSpecUrlGitHub(url) {
    let matches = url.match(REGEX_SPEC_URL_GITHUB);

    // TODO Support other values
    var file = 'index.html';

    let ref = 'master';

    if (MASTER_TO_GH_PAGES.includes(`${matches[1]}/${matches[2]}`) || (GH_PAGES.includes(`${matches[1]}/${matches[2]}`))) {
        ref = 'gh-pages';
    }

    let repoUrl = `https://github.com/${matches[1]}/${matches[2]}/blob/${ref}/${file}`;

    formatRepoUrl(repoUrl);
}

//#endregion

//#region get path

function getSpecUrl(url, data) {
    if (url.match(REGEX_COMMIT_URL)) {
        let matches = url.match(REGEX_COMMIT_URL);
        let commit = data && data.sha ? data.sha : matches[3];

        var file = 'index.html';
        // if (FILE_NOT_INDEX_HTML.includes(`${matches[1]}/${matches[2]}`)) {
        //     if (`${matches[1]}/${matches[2]}` === "w3c/wcag21") {
        //         file = 'guidelines/index.html';
        //     }
        // }

        let r = url.replace(REGEX_COMMIT_URL, `https://rawgit.com/$1/$2/${commit}/${file}`);

        if (MASTER_TO_GH_PAGES.includes(`${matches[1]}/${matches[2]}`)) {
            let apiUrl = `${GITHUB_API_URL}/repos/${matches[1]}/${matches[2]}/commits?sha=gh-pages`;

            result.appendChild(sk);

            fetch(apiUrl)
                .then(res => {
                    if (!res.ok) {
                        console.error('Failed to fetch the commits from GitHub API');
                        return;
                    }

                    return res.json();
                })

                .then(commitsData => {
                    for (let i = 0; i < commitsData.length; i++) {
                        if (getCommitHashFromString(commitsData[i].commit.message)) {
                            commit = getCommitHashFromString(commitsData[i].commit.message);
                            r = url.replace(REGEX_COMMIT_URL, `https://rawgit.com/$1/$2/${commitsData[i].sha}/${file}`);

                            sk.remove();

                            resultUrl.innerHTML = '<a href="' + r + '">' + r + '</a>';
                            result.appendChild(resultUrl);
                            result.appendChild(copyButton);
                            setValid();

                            return r;
                        }
                    }
                });
        } else if (CSSWG_DRAFTS.includes(`${matches[1]}/${matches[2]}`)) {
            console.log('csswg detected');
        } else {
            let apiUrl = `${GITHUB_API_URL}/repos/${matches[1]}/${matches[2]}/commits/${matches[3]}`;

            result.appendChild(sk);

            fetch(apiUrl)
                .then(res => {
                    if (!res.ok) {
                        console.error('Failed to fetch the commit from GitHub API');
                        return;
                    }

                    return res.json();
                })

                .then(commitData => {
                    r = url.replace(REGEX_COMMIT_URL, `https://rawgit.com/$1/$2/${commitData.sha}/${file}`);

                    sk.remove();

                    resultUrl.innerHTML = '<a href="' + r + '">' + r + '</a>';
                    result.appendChild(resultUrl);
                    result.appendChild(copyButton);
                    setValid();

                    return r;
                });
        }
    }
}

//#endregion

//#region utility functions

function getCommitHashFromString(str) {
    const COMMIT_HASH = /Deploy to GitHub Pages: \b([0-9a-f]{40})\b/;
    if (COMMIT_HASH.exec(str)) {
        return COMMIT_HASH.exec(str)[1];
    } else {
        return null;
    }
}

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

//#endregion

function getSnapshot() {
    let url = inputUrl.value.trim();

    if (REGEX_COMMIT_URL.test(url)) {
        formatCommitUrl(url);
    } else if (REGEX_REPO_URL.test(url)) {
        formatRepoUrl(url);
    } else if (REGEX_SPEC_URL_GITHUB.test(url)) {
        formatSpecUrlGitHub(url);
    } else {
        setInvalid();
    }
}

function setInvalid() {
    copyButton.disabled = true;

    inputUrl.classList.remove('valid');

    if (inputUrl.value.trim().length) {
        inputUrl.classList.add('invalid');
    } else {
        inputUrl.classList.remove('invalid');
    }

    result.innerHTML = 'Snapshot URL: ';
}

function setValid() {
    copyButton.disabled = false;

    inputUrl.classList.remove('invalid');
    inputUrl.classList.add('valid');
}

// document.getElementById("generate").addEventListener("click", function (event) {
//     getSnapshot();
// }, false);