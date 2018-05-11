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
'w3c/hr-time']

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

inputUrl.addEventListener('input', getSnapshotHistory);

getSnapshotHistory();

//#endregion

//#region snapshot history functions

function showHistory(url) {
    // To be implemented
}

//#endregion

//#region format functions

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

function getSnapshotHistory() {
    let url = inputUrl.value.trim();

    if (REGEX_SPEC_URL_GITHUB.test(url)) {
        showHistory(url);
    } else {
        setInvalid();
    }
}

function setInvalid() {
    inputUrl.classList.remove('valid');

    if (inputUrl.value.trim().length) {
        inputUrl.classList.add('invalid');
    } else {
        inputUrl.classList.remove('invalid');
    }

    result.innerHTML = 'To be implemented';
}

function setValid() {
    inputUrl.classList.remove('invalid');
    inputUrl.classList.add('valid');
}

// document.getElementById("generate").addEventListener("click", function (event) {
//     getSnapshotHistory();
// }, false);