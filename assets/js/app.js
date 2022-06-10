window.onload = () => {
    //Wrapping things up
    let freelancers = null;

    const year = document.getElementById('year');
    const monthList = document.getElementById('monthList');

    let configExample = JSON.stringify(
        [
            {
                "name" : "Person 1",
                "days" : {
                    "1" : 7.5, 
                    "2" : 7.5, 
                    "3" : 7.5,
                    "4" : 7.5,
                    "5" : 7.5,
                },
                "price": 10
            },
        ], 
        undefined, 
        4
    );

    const priceFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });//Display price in currency mask

    //End of "wrapping things up"


    //Functions start
    function startApp(){
        setYearField();
        setMonthField();
        freelancers = getConfig();
        if(freelancers === null){
            setConfig(configExample); 
            freelancers = getConfig();
        }

        document.getElementById('fpcConfigTextarea').value = JSON.stringify(
            freelancers, 
            undefined, 
            4
        );
    }

    function setYearField(){
        document.getElementById('year').value = new Date().getFullYear();;
    }

    function setMonthField(){
        let currentMonth = new Date().getMonth();
        if(currentMonth > 0) currentMonth --; //This sets month field to last month, wich usually is our target.
        monthList.value = currentMonth;
    }

    function getConfig(){
        try {
            let fpcConfig = localStorage.getItem('fpcConfig');
            return fpcConfig !== null ? JSON.parse(fpcConfig) : null; //fpc = Freelancers payment calculator
        }catch (error){
            alert(error);
        }
    }

    function setConfig(config){
        try {
            localStorage.setItem('fpcConfig', config);
            freelancers = getConfig();
        }catch (error){
            alert(error);
        }
    }

    function checkRequiredValues(){
        for(i = 0; i < arguments.length; i++){
            if(arguments[i] === "") return false;
        };

        return true;
    }

    function getWorkedDaysAndHours(year,month,days){
        try{
            let date = new Date(Date.UTC(year, month, 1));
            let worked = [0,0];
            let totalDays = 0;
            let day = '';

            while (date.getUTCMonth().toString() == month) {
                day = new Date(date).getDay() + 1;
                day = day.toString();
                if(day in days){ 
                    worked[0] ++;
                    worked[1] = worked[1] + days[day];
                }

                totalDays++;
                date.setUTCDate(date.getUTCDate() + 1)
            }

            return worked;
        }catch (error){
            finalReport(error);
        }
    }

    function calculatePayment(workedHours, freelancersHourPrice){
        return priceFormatter.format(workedHours * freelancersHourPrice);
    }

    function finalReport(freelancers){
        let worked = 0;
        let payment = 0;
        let report = '';
        let totalToPay = 0;

        for(let currentFreelancer in freelancers){
            worked = getWorkedDaysAndHours(year.value, monthList.value, freelancers[currentFreelancer].days);

            payment =  calculatePayment(worked[1], freelancers[currentFreelancer].price);
            report += `
            <tr>
                <td>${freelancers[currentFreelancer].name}</td>
                <td>${freelancers[currentFreelancer].price}</td>
                <td>${worked[0]}</td>
                <td>${worked[1]}</td>
                <td>${payment}</td>
            </tr>
            `;

            totalToPay += parseFloat(payment.replace(/[^\d.-]/g, '')); //Leave only numbers
            
        }

        totalToPay = priceFormatter.format(totalToPay);
        report += `<tr><td></td><td></td><td></td><td><b>Total:</b></td><td><b>${totalToPay}</b></td></tr>`;

        return [report];
    }


    function displayReportResult(report){
        document.getElementById('resultDisplayer').innerHTML = report;
    }

    function toggleTabs(){
        document.getElementById('pills-calculate').classList.toggle("active");
        document.getElementById('pills-calculate').classList.toggle("show");
        document.getElementById('pills-config').classList.toggle("active");
        document.getElementById('pills-config').classList.toggle("show");
        btnCalculateTab.classList.toggle("active");
        btnConfigTab.classList.toggle("active");
    }
    //Functions end


    //Action buttons bindings start
    const btnReport = document.getElementById('btnReport');
    const btnSetConfig = document.getElementById('btnSetConfig');
    const btnResetConfig = document.getElementById('btnResetConfig');
    const btnCalculateTab = document.getElementById('btnCalculateTab');
    const btnConfigTab = document.getElementById('btnConfigTab');

    btnReport.onclick = function(){
        if(checkRequiredValues(year.value, monthList.value)){
            displayReportResult(finalReport(freelancers));
        }else{
            displayReportResult(`Make sure to inform year and month.`);
        }
    }
    
    btnSetConfig.onclick = function(){
        try{
            let newConfig = JSON.parse(JSON.stringify(document.getElementById('fpcConfigTextarea').value));
            setConfig(newConfig);
        } catch (error){
            alert('It appears something is wrong with config. Please, check it out.');
        }
    }

    btnResetConfig.onclick = function(){
        setConfig(configExample);
        document.getElementById('fpcConfigTextarea').value = configExample;
    }

    btnCalculateTab.onclick = function(){
        toggleTabs();
    }

    btnConfigTab.onclick = function(){
        toggleTabs();
    }
    //Action buttons bindings end

    
    //Lets roll
    startApp();

}