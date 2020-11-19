if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
   
if (Cookies.get('visitTime') === undefined) {
    var cTime = new Date().getTime();
    Cookies.set('visitTime', cTime, { expires: 1 })
} else {
    
    //86400 24 hrs
}

if ($('#count').length){
(function () {

    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

    x = setInterval(function () {
        let now = new Date().getTime(),
            distance = parseInt(Cookies.get('visitTime')) + 86400000 - now;
            document.getElementById("hours").innerText = Math.floor((distance % (day)) / (hour)),
            document.getElementById("minutes").innerText = Math.floor((distance % (hour)) / (minute)),
            document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);

        //do something later when date is reached

        //seconds
    }, 0)
}())}else{};