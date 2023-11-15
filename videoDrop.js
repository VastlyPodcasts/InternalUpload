
console.log('running');



// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js'
import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-analytics.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
import { getFirestore, collection, getDocs, Timestamp, FieldValue, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCK1j7O78A70PhIQ08H4akqWorPB3QKEA",
  authDomain: "rizeo-40249.firebaseapp.com",
  projectId: "rizeo-40249",
  storageBucket: "rizeo-40249.appspot.com",
  messagingSenderId: "848133434953",
  appId: "1:848133434953:web:6dd766e0efa41fcd40d998",
  measurementId: "G-LNRB6CG9H7"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

const video_ref = collection(db, 'videos');
const author_ref = collection(db, 'authors');
const channels_ref = collection(db, 'channels');

// const db = getFirestore();

document.getElementById('submitBtn').addEventListener('click', (event) => {
  markComplete();

  if (allFieldsComplete()) {
    uploadFile();
    } else {
      markIncomplete();

      // console.log("we here")
    }
});

fillChannels()

async function uploadFile() {
    if (!isFileInputEmpty()) {
        const id = uuidv4();
        const file = document.getElementById('myfile').files[0];
        let fileRef = cleanFileName(getFilePath());
        const storageRef = ref(storage, fileRef);

        const uploadTask = uploadBytesResumable(storageRef, file);

        let paused = false;
        
        document.getElementById('progress').style.display = "block"; 
        document.getElementById('pauseBtn').style.display = "block";

        document.getElementById('pauseBtn').addEventListener('click', (event) => {
          if (paused) {
            uploadTask.resume();
          } else {
            uploadTask.pause();
          }
        });

        uploadTask.on('state_changed', 
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');

            document.getElementById('progress').innerHTML = "Uploading... " + progress.toFixed(2);
            document.getElementById('content').style.display = "none";


            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                document.getElementById('progress').innerHTML = "Paused at " + progress.toFixed(2);
                document.getElementById('pauseBtn').innerHTML = "Resume";
                document.getElementById('progress').style.color = "red";
                paused = true;
                break;
              case 'running':
                paused = false;
                document.getElementById('pauseBtn').value = "Resume";
                console.log('Upload is running');
                break;
            }
          }, 
          (error) => {
            // Handle unsuccessful uploads
            document.getElementById('progress').style.color = "red";
            document.getElementById('progress').innerHTML = "Upload Failed";
            alert("Upload failed due to: " + error);
            document.getElementById('pauseBtn').style.display = "block";


          }, 
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            submitInfo(id);
            document.getElementById('progress').style.color = "lightgreen";
            document.getElementById('progress').innerHTML = "Done!";
            document.getElementById('pauseBtn').style.display = "none";
            document.getElementById('content').style.display = "";
            document.getElementById("myForm").reset();

            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
            });
          }
        );

        

    } else {
        return false
    }

}

function getFilePath() {
    let fileInput = document.getElementById('myfile')//.addEventListener('change', function() {
        // if (this.files && this.files.length > 0) {
          if (!isFileInputEmpty()) {
              const selectedFile = fileInput.files[0];
              console.log("File Name: ", selectedFile.name);
              return cleanFileName(selectedFile.name)
              console.log("File Size: ", selectedFile.size);
              console.log("File Type: ", selectedFile.type);
              return true;
          }
          return "";
        // }
    // });
}

function isFileInputEmpty() {
    var inputFile = document.getElementById('myfile');
    
    if (inputFile.files.length === 0) {
        console.log("No file selected.");
        return true;
    } else {
        console.log("File has been selected.");
        return false;
    }
}

async function fillChannels() {
    try {
        // const db = getFirestore();

        await fillAuthors();
        const snapshot = await getDocs(channels_ref);
        // getDocs(channels)
        let channels = []

        snapshot.docs.forEach(doc => {
          let data = doc.data();
          channels.push(doc.id)
        //   let found = false
        });



        for (let row of document.getElementsByClassName('channel-select')) {
            for(let channel of channels) {
                
                var option = document.createElement("option");
        
                // Set the value attribute
                option.value = channel;
        
                // Set the display text
                option.text = channel;
                
                row.appendChild(option);
            }
        }

        initDropDown();
        signIn();
        console.log("finished")
        console.log(channels.length)


    } catch (error) {
        console.log(error)
    }


}

async function fillAuthors() {
    try {
        // const db = getFirestore();


        const snapshot = await getDocs(author_ref);
        // getDocs(channels)
        let authors = []

        snapshot.docs.forEach(doc => {
          let data = doc.data();
          authors.push(doc.id)
        //   let found = false
        });



        for (let row of document.getElementsByClassName('author-select')) {
            for(let author of authors) {
                
                var option = document.createElement("option");
        
                // Set the value attribute
                option.value = author;
        
                // Set the display text
                option.text = author;
                
                row.appendChild(option);
            }
        }

        // initDropDown();
        console.log("finished")
        console.log(authors.length)


    } catch (error) {
        console.log(error)
    }

}

function cleanFileName(fileName) {

  const CHARS_TO_REMOVE = ["?", "-", ",", "'", "`", "$", "&", "%", "#", "@", "^", "*", "<", ">", "(", ")", ":", ";", "[", "]", "/"]

  var cleanedName = fileName.replace(/\?/g, "");
  cleanedName = cleanedName.replace(/-/g, "");
  cleanedName = cleanedName.replace(/ /g, "_");
  cleanedName = cleanedName.replace(/,/g, "");
  cleanedName = cleanedName.replace(/'/g, "");
  cleanedName = cleanedName.replace(/\$/g, "");
  cleanedName = cleanedName.replace(/%/g, "");
  cleanedName = cleanedName.replace(/&/g, "");
  cleanedName = cleanedName.replace(/@/g, "");
  cleanedName = cleanedName.replace(/#/g, "");
  cleanedName = cleanedName.replace(/\(/g, "");
  cleanedName = cleanedName.replace(/\)/g, "");
  cleanedName = cleanedName.replace(/\*/g, "");
  cleanedName = cleanedName.replace(/\+/g, "");
  cleanedName = cleanedName.replace(/!/g, "");

  // cleanedName = cleanedName.replace("`", "");

  return cleanedName;
}

async function updateDocument(video, id) {

  const ref = doc(db, "videos", id);

  await setDoc(ref, {
    title: video.title,
    author: video.author,
    bio: video.bio, 
    fileName: video.fileName,
    channels: video.channels,
    youtubeURL: video.youtubeURL,
    episodeID: video.episodeID,
    date: video.date,
    fullDate: video.fullDate,
    viewedCount: video.viewedCount,
    likedCount: video.likedCount
  });

  // console.log('Document updated' + channel);
}

async function submitInfo(id) {

  let title = valueFromId("title-text")
  let channels = [valueFromDropdown("mainChannel")]

  if (valueFromDropdown("extraChannel1") != 0) {
    channels.push(valueFromDropdown("extraChannel1"))
  }
  if (valueFromDropdown("extraChannel2") != 0) {
    channels.push(valueFromDropdown("extraChannel2"))
  }


  let video = {
    title: title,
    author: valueFromDropdown("authorSelect"),
    bio: valueFromId("bio-text"),
    fileName: getFilePath(),
    channels: channels,
    youtubeURL: valueFromId("link"),
    episodeID: valueFromId("episodeID"),
    date: formatDateString(valueFromId("date")),
    fullDate: valueFromId("date"),
    viewedCount: 0,
    likedCount: 0
  }

  try {
    await updateDocument(video, id);
  } catch (error) {
    console.log(error)
  }

}

function formatDateString(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const parts = dateStr.split('-');
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript

  return `${months[monthIndex]} ${year}`;
}

function valueFromId(id) {
  if (document.getElementById(id).value) {
    return document.getElementById(id).value;
  } else {
    return "";
  }
  // console.log(document.getElementById(id).innerHTML)
  // console.log(document.getElementById(id).value)

// console.log(titleValue);  // This will log the value of the field to the console
  return titleValue
}

function valueFromDropdown(id) {
  // console.log(document.getElementById(id).childNodes[1].innerHTML)
  if (document.getElementById(id).childNodes[1].value != 0) {
    return document.getElementById(id).childNodes[1].value
  }
  return "";
}

function markComplete() {
  removeRed('myfile');
  removeRed('title-text');
  removeRed('mainChannel');
  removeRed('authorSelect');
  // removeRed('link');
  removeRed('bio-text');
  document.getElementById('incomplete').style.display = "none"
}

function markIncomplete() {
  addRed('myfile');
  addRed('title-text');
  addRed('mainChannel');
  addRed('authorSelect');
  // addRed('link');
  addRed('bio-text');
  document.getElementById('incomplete').style.display = "block"

}

function addRed(id) {
  if (id == 'myfile') {
    if (isFileInputEmpty()) {
      document.getElementById(id).style.border = "2px solid red";
    }
    return;
  }

  if (document.getElementById(id).value == "") {
    document.getElementById(id).style.border = "2px solid red"
  } else if (document.getElementById(id).childNodes.length > 1) {
    if (document.getElementById(id).childNodes[1].value == 0) {
      document.getElementById(id).style.border = "2px solid red"
    }
  }
}

function removeRed(id) {
  if (id == 'myfile') {
    if (!isFileInputEmpty()) {
      document.getElementById(id).style.border = "";
    }
    return;
  }
  if (document.getElementById(id).value != "") {
    document.getElementById(id).style.border = ""
  }
}

function allFieldsComplete() {

  if (valueFromDropdown("mainChannel") != "") {
    if (valueFromId("title-text") != "") {
      if (valueFromDropdown("authorSelect") != "") {
        // if (valueFromId("link") != "") {
          if (valueFromId("bio-text") != "") {
            if (!isFileInputEmpty()) {
            return true
            }
          }
        // }
      }
    }
  }
  return false
}

async function signIn() {

  const email = "internal@vastlypodcasts.com"
  const pw = "12345678"

  signInWithEmailAndPassword(auth, email, pw)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}

function initDropDown() {

    var x, i, j, l, ll, selElmnt, a, b, c;
    /* Look for any elements with the class "custom-select": */
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
      selElmnt = x[i].getElementsByTagName("select")[0];
      ll = selElmnt.length;
      /* For each element, create a new DIV that will act as the selected item: */
      a = document.createElement("DIV");
      a.setAttribute("class", "select-selected");
      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
      x[i].appendChild(a);
      /* For each element, create a new DIV that will contain the option list: */
      b = document.createElement("DIV");
      b.setAttribute("class", "select-items select-hide");
      for (j = 1; j < ll; j++) {
        /* For each option in the original select element,
        create a new DIV that will act as an option item: */
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function(e) {
            /* When an item is clicked, update the original select box,
            and the selected item: */
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
              if (s.options[i].innerHTML == this.innerHTML) {
                s.selectedIndex = i;
                h.innerHTML = this.innerHTML;
                y = this.parentNode.getElementsByClassName("same-as-selected");
                yl = y.length;
                for (k = 0; k < yl; k++) {
                  y[k].removeAttribute("class");
                }
                this.setAttribute("class", "same-as-selected");
                break;
              }
            }
            h.click();
        });
        b.appendChild(c);
      }
      x[i].appendChild(b);
      a.addEventListener("click", function(e) {
        /* When the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
    }
    
    function closeAllSelect(elmnt) {
      /* A function that will close all select boxes in the document,
      except the current select box: */
      var x, y, i, xl, yl, arrNo = [];
      x = document.getElementsByClassName("select-items");
      y = document.getElementsByClassName("select-selected");
      xl = x.length;
      yl = y.length;
      for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
          arrNo.push(i)
        } else {
          y[i].classList.remove("select-arrow-active");
        }
      }
      for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
          x[i].classList.add("select-hide");
        }
      }
    }
    
    /* If the user clicks anywhere outside the select box,
    then close all select boxes: */
    document.addEventListener("click", closeAllSelect);
    
}


    