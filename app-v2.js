var firebaseConfig = {
    apiKey: "AIzaSyA2VeFSrICYIz41dXRqh70jywiSsZAXCjQ",
    authDomain: "stock-check-go.firebaseapp.com",
    projectId: "stock-check-go",
    storageBucket: "stock-check-go.appspot.com",
    messagingSenderId: "810157740491",
    appId: "1:810157740491:web:784539aecfb84d32a2a64e",
    databaseURL: "https://stock-check-go-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

//Globals
const hello = "this is working";
const API_KEY = "1d603f4860b4145cad9e985a1a68dacd";
// let stockSymbol = "MSFT"
// let dateFrom = "";

//chartIT();

let stockClose = [];
let dates = [];


//IIFE Function to push the entered info to the Firebase DB
(function () {     
    //Push Stock Symbol to the Firebase Database
    document.querySelector("#message-form-stock")
    .addEventListener("submit", function (event){
        event.preventDefault();
        const stockSymbol = document.querySelector("#message-stock").value;
        document.querySelector("#message-stock").value = "";
        chartIT();
        // Async funtion waits for data to arrive.
        async function getData(){
                const response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${stockSymbol}`);
                const data = await response.json(); //parses the response to JSON
                const dataArray = data.data; //Extracts the Data from the JSON
                dataArray.forEach((dataPoint) => {
                         stockClose.push(dataPoint.close)//pushes the end of day closing value of the stocks to the array.
                         const date = dataPoint.date.split("T")[0];//splits the date to remove the time factor as its in ISO 8601 format
                         dates.push(date);//pushes the sates to the array      
                    })

                };

        // Async function which waits for the data then charts it.
        async function chartIT () { 

                await getData();
                const ctx = document.getElementById('myChart');
                let myChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: dates.reverse(),
                        datasets: [{
                            label: 'EOD',
                            data: stockClose,
                            backgroundColor: ['rgba(36, 104, 122, 1)'],
                            borderColor: ['rgba(0, 0, 0, 0.63)'],
                            borderWidth: 1
                        }],
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: `${stockSymbol} closing values`
                            }
                        },
                        scales: {
                            y: {
                                //beginAtZero: true,
                                title: {
                                    color: "rgba(0, 82, 30, 1)",
                                    padding: 4,
                                    display: true,
                                    text: "Price",
                                }
                            },
                            x: {
                                title: {
                                    color: "rgba(0, 82, 30, 1)",
                                    padding: 4,
                                    display: true,
                                    text: "Date"
                                }

                            }
                        },
                    },
                } );
                document.getElementById("destroy").addEventListener("click",
                function(e){
                    //e.preventDefault();
                    location.reload();
                })

            };

    });
})();

(function(){    
    //Push Profile to the Firebase Database
    document.querySelector("#message-form-profile")
    .addEventListener("submit",function (event){
        event.preventDefault();
        const profile = document.querySelector("#message-profile").value;
        document.querySelector("#message-profile").value = "";
        const profileRef = db.ref("profile");
        profileRef.push({
            profile: profile,
        })
    });

    getProfile();

})();

function getProfile() {
    //Get Date From data from Firebase DB
    db.ref("profile").on("value", function(results){
        let profile = [];
        const messageBoard = document.querySelector(".message-board");

        const allInfo = results.val();

        for (let info in allInfo) {
            const retrieveDateFrom = allInfo[info].profile
            const profileElement = document.createElement("li");
            profileElement.setAttribute("data-id", info);
            profileElement.innerText = retrieveDateFrom;
            profile.push(profileElement);

            const deleteElement = document.createElement("i");
            deleteElement.className = "fa fa-trash pull-right delete";
            profileElement.appendChild(deleteElement);
            deleteElement.addEventListener('click', function(){
               db.ref(`profile/${info}`).remove();
            })
        }
        messageBoard.innerHTML = "";
        profile.forEach(element => messageBoard.append(element))
    });
};
