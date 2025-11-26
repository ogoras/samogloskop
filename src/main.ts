import LocalStorageMediator from './model/LocalStorageMediator.js';
import StateMachine from './logic/StateMachine.js';
import nextController from './logic/controller/nextController.js';
import { INSTRUCTION_YT_VID_ID, DEMO_YT_VID_ID } from './const/Help.js';

import { VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH } from './const/version.js';
console.log(`%cSamogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`,
     "font-size: 3rem; font-weight: bold;");

const lsm = LocalStorageMediator.getInstance();
lsm.load();

const sm = StateMachine.getInstance();
sm.state = lsm.state;
sm.lsm = lsm;

if (!lsm.dataConsentGiven) {
     // construct a welcome view :)
     const mainContainer = document.getElementsByClassName('main-container')[0];
     // add a title to the main container
     const title = document.createElement('h1');
     title.innerHTML = "Witaj w aplikacji <i>Samogłoskop</i>!";
     mainContainer!.appendChild(title);
     // Okay, the main container should also contain the following elements:
     // Let's create a flexbox that is either vertical or horizontal depending on the screen size
     const flexbox = document.createElement('div');
     flexbox.classList.add('flex-oriented');
     mainContainer!.appendChild(flexbox);
     // 1. Embedded YouTube demonstration video
     // create a div for the demo video
     const demoDiv = document.createElement('div');
     flexbox.appendChild(demoDiv);
     let h3 = document.createElement('h3');
     h3.innerText = "Zobacz krótki film demonstracyjny:";
     demoDiv.appendChild(h3);
     const demoFrame = document.createElement('iframe');
     demoFrame.classList.add('third')
     demoFrame.classList.add('hasNeighbor')
     demoFrame.src = `https://www.youtube.com/embed/${DEMO_YT_VID_ID}`;
     demoFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
     demoFrame.referrerPolicy = "strict-origin-when-cross-origin";
     demoFrame.allowFullscreen = true;
     demoDiv!.appendChild(demoFrame);
     // 2. Embedded YouTube instruction video
     // 2a. Acknowledgement that the instruction video is outdated and desribe what has changed
     const instructionDiv = document.createElement('div');
     flexbox.appendChild(instructionDiv);
     h3 = document.createElement('h3');
     h3.innerText = "Obejrzyj instrukcję korzystania z aplikacji:";
     instructionDiv.appendChild(h3);
     const instructionFrame = document.createElement('iframe');
     instructionFrame.classList.add('third')
     instructionFrame.src = `https://www.youtube.com/embed/${INSTRUCTION_YT_VID_ID}`;
     instructionFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
     instructionFrame.referrerPolicy = "strict-origin-when-cross-origin";
     instructionFrame.allowFullscreen = true;
     instructionDiv.appendChild(instructionFrame);
     let p = document.createElement('p');
     p.innerText = "Uwaga: film jest nieco nieaktualny. Badanie zostało zakończone, więc można ćwiczyć bez ograniczeń czasowych. Usunięty został test końcowy i grupa kontrolna.";
     // make text reddish
     p.style.color = "#cc0000";
     instructionDiv.appendChild(p);

     const usefulLinksDiv = document.createElement('div');
     flexbox!.appendChild(usefulLinksDiv);
     h3 = document.createElement('h3');
     h3.innerText = "Przydatne linki:";
     // 3. Link to the master's thesis PDF
     usefulLinksDiv.appendChild(h3);
     p = document.createElement('p');
     p.innerHTML = "<br>";
     const thesisLink = document.createElement('a');
     thesisLink.href = "samogloskop_magisterka.pdf";
     thesisLink.innerHTML = "Zobacz <b>pracę magisterską</b> opisującą aplikację Samogłoskop (PDF)";
     thesisLink.target = "_blank";
     p.appendChild(thesisLink);
     usefulLinksDiv.appendChild(p);
     p = document.createElement('p');
     p.innerHTML = "W pracy magisterskiej znajdziesz szczegółowy opis aplikacji, metodologii badania oraz analizę wyników.";
     p.style.marginTop = "0.5rem";
     usefulLinksDiv.appendChild(p);
     // 4. Link to the GitHub repository
     let spacer = document.createElement('br');
     usefulLinksDiv.appendChild(spacer);
     p = document.createElement('p');
     const githubLink = document.createElement('a');
     githubLink.href = "https://github.com/ogoras/samogloskop";
     githubLink.innerHTML = "<b>Repozytorium GitHub</b>";
     githubLink.target = "_blank";
     p.appendChild(githubLink);
     usefulLinksDiv.appendChild(p);
     // 5. Link to the info.html subpage
     spacer = document.createElement('br');
     usefulLinksDiv.appendChild(spacer);
     p = document.createElement('p');
     const infoLink = document.createElement('a');
     infoLink.href = "info.html";
     infoLink.innerHTML = "Więcej informacji";
     infoLink.target = "_blank";
     p.appendChild(infoLink);
     usefulLinksDiv.appendChild(p);
     // 6. Link to the privacy policy
     spacer = document.createElement('br');
     usefulLinksDiv.appendChild(spacer);
     p = document.createElement('p');
     const privacyLink = document.createElement('a');
     privacyLink.href = "privacy.html";
     privacyLink.innerHTML = "Polityka prywatności";
     privacyLink.target = "_blank";
     p.appendChild(privacyLink);
     usefulLinksDiv.appendChild(p);
     // 7. Button to proceed to the app (not synonymous with data consent, that's the next step), it will just run nextController and clear the mainController after clicking
     const proceedButton = document.createElement('button');
     proceedButton.innerText = "Przejdź do aplikacji";
     proceedButton.onclick = () => {
          mainContainer!.innerHTML = "";
          nextController({sm, lsm});
     };
     proceedButton.style.width = "fit-content";
     proceedButton.style.margin = "2rem auto";
     mainContainer!.appendChild(proceedButton);
} else {
     nextController({sm, lsm});
}