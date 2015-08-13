/**
 * Created by rex on 2015/7/27.
 */

class JobCalendar{
    constructor(dom:any,option:any){
        ;
    }

    private countMonthOfyear(year:number){
        return 12;
    }

    private countDayOfMonth(year:number, month:number){
        var day = new Date(year,month,0);
        return day.getDate();
    }

    private drawCalendar(){
        ;
    }
}

var dom = document.getElementsByClassName("jobcalendar")[0];
var cal = new JobCalendar(dom,null);
