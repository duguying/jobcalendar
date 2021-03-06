/**
 * Created by rex on 2015/7/27.
 */
class JobCalendar {
    private static ME:JobCalendar = null;

    // elements
    private yearElements:HTMLElement[] = []; // 年元素集
    private monthElements:HTMLElement[] = []; // 月元素集
    private bindElements:{"focus":any;"element":HTMLInputElement;"callback":Function}[] = []; // 绑定 input 集
    private currentFocusElement:HTMLInputElement;
    private frameBox:HTMLElement;
    private frameYear:HTMLElement;
    private ulYear:HTMLElement;
    private frameMonth:HTMLElement;
    private ulMonth:HTMLElement;
    private liToNow:HTMLElement; // 至今

    // definations
    private yearNum:number = 1; // 日历范围 - 年数
    private cnMonth:string[] = ["一","二","三","四","五","六","七","八","九","十","十一","十二"];
    private cnToNow:string = "至今";
    private enMonth:string[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    private enToNow:string = "To Now";
    private nowDate:Date = new Date();

    // options
    private lang:string = this.getSysLang();
    private hasToNow:boolean = false;
    private startYear:number = 1970; // 日历范围 - 起始年
    private endYear:number = this.nowDate.getUTCFullYear(); // 日历范围 - 结束年
    private enableStart:number = 197001; // 有效开始年月
    private enableEnd:number = this.nowDate.getUTCFullYear() * 100 + (this.nowDate.getUTCMonth() + 1); // 有效结束年月

    private selectYear:number = null;
    private selectMonth:number = null;
    private isToNow:boolean = false;

    constructor() {
        this.createYearUl();
        this.createMonthUl();
        this.createFrameBox();
    }

    public static getInstance():JobCalendar{
        if(!JobCalendar.ME){
            JobCalendar.ME = new JobCalendar();
        }
        return JobCalendar.ME;
    }

    private updateOptionFromAttr():void{
        var lang:string = this.currentFocusElement.getAttribute("data-lang");
        lang = lang?this.trim(lang.toString()):null;

        var hasToNowString:string = this.currentFocusElement.getAttribute("data-has-to-now");
        var hasToNow:boolean = hasToNowString?this.trim(hasToNowString.toString()) == "true":false;
        if(!hasToNow){
            this.isToNow = false;
        }

        var startYearString:string = this.currentFocusElement.getAttribute("data-start-year");
        var startYear:number = startYearString?parseInt(this.trim(startYearString.toString())):0;

        var endYearString:string = this.currentFocusElement.getAttribute("data-end-year");
        var endYear:number = endYearString?parseInt(this.trim(endYearString.toString())):0;

        var startEnabledString:string = this.currentFocusElement.getAttribute("data-start-enabled");
        if(startEnabledString && startEnabledString.indexOf(".")>=0){
            var arr:string[] = startEnabledString.split(".");
            var enabled = parseInt(arr[0])*100+parseInt(arr[1]);
            startEnabledString = enabled.toString();
        };
        var startEnabled:number = startEnabledString?parseInt(this.trim(startEnabledString.toString())):0;

        var endEnabledString:string = this.currentFocusElement.getAttribute("data-end-enabled");
        if(endEnabledString && endEnabledString.indexOf(".")>=0){
            var arr:string[] = endEnabledString.split(".");
            var enabled = parseInt(arr[0])*100+parseInt(arr[1]);
            endEnabledString = enabled.toString();
        };
        var endEnabled:number = endEnabledString?parseInt(this.trim(endEnabledString.toString())):0;

        this.updateOption({lang:lang, hasToNow:hasToNow, startYear:startYear, endYear:endYear, startEnabled:startEnabled, endEnabled:endEnabled});
    }

    public updateOption(option:{lang:string;hasToNow:boolean;
            startYear:number; endYear:number;
            startEnabled:number; endEnabled:number}):void{
        JobCalendar.ME.update(option);
    }

    private getMonthNumber(month:string):number{
        var monthArray:string[];
        if(this.lang == "en-US"){
            monthArray = this.enMonth;
        }else{
            monthArray = this.cnMonth;
        }
        for(var i:number = 0; i < monthArray.length; i++){
            if(monthArray[i] == month){
                return i + 1;
            }
        };
    }

    public addBindingElement(ele:HTMLInputElement, callback:Function){
        this.bindElements.push({"element":ele, "callback":callback, "focus":null});
        this.bindInputFocus(ele);
    }

    public removeBindingElement(ele:HTMLInputElement){
        for (var idx in this.bindElements){
            if(this.bindElements[idx]["element"] == ele){
                this.bindElements[idx]["callback"] = null;
                ele.removeEventListener("focus",this.bindElements[idx]["focus"]);
                delete this.bindElements[idx];
            };
        }
    }

    private fillBackInput(){
        if(this.isToNow){
            if(this.lang == "zh-CN"){
                this.currentFocusElement.value = this.cnToNow;
            }else{
                this.currentFocusElement.value = this.enToNow;
            }
            return;
        }

        this.currentFocusElement.value = this.selectYear.toString() + "." + this.selectMonth.toString();
        for(var idx in this.bindElements){
            var ele:HTMLInputElement = this.bindElements[idx]["element"];
            if(ele == this.currentFocusElement){
                if(typeof(this.bindElements[idx]["callback"]) == "function"){
                    this.bindElements[idx]["callback"]();
                }
                return;
            }
        }
    }

    /**
     * 根据 input 中的内容初始化 active 选中状态
     */
    private activeFromInputValue(){
        var val:string = this.currentFocusElement.value;
        if(val){
            var toNow:string = this.cnToNow;
            if(this.lang == "en-US"){
                toNow = this.enToNow;
            }

            if(this.trim(val) == toNow){
                if(this.hasToNow) {
                    this.isToNow = true;
                    this.setActiveToNow();
                }
            }else{
                var year:number;
                var month:number;
                var arr:string[] = this.trim(val).split(".");
                if(arr.length>=2){
                    year = parseInt(arr[0]);
                    month = parseInt(arr[1]);
                    if(year*100+month>=this.enableStart && year*100+month<=this.enableEnd){
                        if(year>=1000 && year<=9999){
                            this.selectYear = year;
                            this.setActiveYear(year);
                        }
                        if(month>=1 && month<=12){
                            this.selectMonth = month;
                            this.setActiveMonth(month);
                        }
                    }
                }
                this.isToNow = false;
            }
        }
    }

    private disabledFocusInput(){
        if(this.currentFocusElement){
            this.currentFocusElement.readOnly = true;
            this.frameBox.focus();
        }
    }

    private enabledFocusInput(){
        if(this.currentFocusElement){
            this.currentFocusElement.readOnly = false;
        }
    }

    private bindInputFocus(ele:HTMLElement){
        var _this:JobCalendar = this;
        if(this.bindElements.length <= 0){
            throw new Error("请先绑定input输入框");
        }

        for(var idx in this.bindElements){
            if(this.bindElements[idx]["element"] == ele){
                this.bindElements[idx]["focus"] = function (e) {
                    e = e||window.event;
                    _this.currentFocusElement = e.target||e.srcElement;
                    // initial input value data into active
                    _this.updateOptionFromAttr();
                    _this.activeFromInputValue();
                    _this.showCalendar();
                };

                this.addEventListener(this.bindElements[idx]["element"], "focus", this.bindElements[idx]["focus"]);
            }
        }


        this.addEventListener(document.body, "click", function (e) {
            e = e||window.event;
            var target = e.target||e.srcElement;
            var mark:number = 0;

            // year li elements
            for(var idx in _this.yearElements){
                var ele:HTMLElement = _this.yearElements[idx];
                if(ele == target){
                    var year:number = parseInt(ele.innerHTML);
                    mark = 1;
                    if(!_this.hasClass(ele, "disabled")){
                        _this.setActiveYear(year);
                        _this.selectYear = year;
                        _this.isToNow = false;
                        _this.clearMonthElements();
                        _this.updateMonthli();
                    }
                    break;
                };
            }

            // month li elements
            for(var idx in _this.monthElements){
                var ele:HTMLElement = _this.monthElements[idx];
                if(ele == target){
                    //console.log("you clicked month",idx);
                    mark = 2;

                    if(!_this.isActiveToNow()){
                        var month:number = _this.getMonthNumber(_this.trim(ele.innerHTML));
                        if(!_this.hasClass(ele, "disabled")) {
                            _this.setActiveMonth(month);
                            _this.selectMonth = month;
                            _this.fillBackInput();
                            _this.hideCalendar();
                        }
                    }

                    return;
                }
            }

            // to now
            if(target == _this.liToNow){
                _this.isToNow = true;
                _this.setActiveToNow();
                _this.fillBackInput();
                _this.hideCalendar();
                return;
            }

            if((target==_this.currentFocusElement) || (target==_this.frameBox) ||
                    target == _this.ulYear || target == _this.ulMonth ||
                    target == _this.frameYear || target == _this.frameMonth){
                // do nothing;
            }else if(mark > 0){
                //console.log("clicked li");
            }else{
                _this.hideCalendar();
            }
        });
    }

    private showCalendar(){
        var left = this.getElementLeft(this.currentFocusElement);
        var top = this.getElementTop(this.currentFocusElement);
        var height = this.currentFocusElement.offsetHeight;
        var box_top = top + height;
        this.frameBox.style.position = "absolute";
        this.frameBox.style.left = left+"px";
        this.frameBox.style.top = box_top+"px";
        this.frameBox.style.display = "";
        this.frameBox.style.backgroundColor = "#fff";
        this.disabledFocusInput();
    }

    private hideCalendar(){
        this.frameBox.style.display = "none";
        this.enabledFocusInput();
    }

    private getElementLeft(element){
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;
        while (current !== null){
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }
    private getElementTop(element){
        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null){
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    private createFrameBox(){
        this.frameBox = document.createElement("div");
        this.addClass(this.frameBox, "calendar");
        this.frameBox.style.display = "none";
        this.frameBox.appendChild(this.frameYear);
        this.frameBox.appendChild(this.frameMonth);
        document.body.appendChild(this.frameBox);
    }

    private createYearUl() {
        this.ulYear = document.createElement("ul");
        this.frameYear = document.createElement("div");
        this.addClass(this.frameYear, "cal-year");
        this.frameYear.appendChild(this.ulYear);
    }

    private createMonthUl() {
        this.ulMonth = document.createElement("ul");
        this.frameMonth = document.createElement("div");
        this.addClass(this.frameMonth, "cal-month");
        this.frameMonth.appendChild(this.ulMonth);
    }

    private updateMonthli(){
        for(var i:number = 0; i < 12; i++){
            var liMonth = document.createElement("li");
            if(this.lang == "en-US"){
                liMonth.innerHTML = this.enMonth[i];
            }else{
                liMonth.innerHTML = this.cnMonth[i];
            }

            if(this.selectYear == Math.floor(this.enableStart/100)){
                if(i<this.enableStart%100-1){
                    this.addClass(liMonth, "disabled");
                }
            }

            if(this.selectYear == Math.floor(this.enableEnd/100)){
                if(i>this.enableEnd%100-1){
                    this.addClass(liMonth, "disabled");
                }
            }

            this.monthElements.push(liMonth);
            this.ulMonth.appendChild(liMonth);
        }
    }

    private updateYearli(){
        var period:number = this.endYear - this.startYear;
        var periodEnable = this.enableEnd - this.enableStart;

        if(period < 0){
            throw Error("please make sure `start<end`");
        }
        if(periodEnable < 0){
            throw Error("please make sure `enableStart<enableEnd`");
        }

        // add to now
        if(this.hasToNow) {
            this.liToNow = document.createElement("li");
            if (this.lang == "en-US") {
                this.liToNow.innerHTML = this.enToNow;
            } else {
                this.liToNow.innerHTML = this.cnToNow;
            }
            this.addClass(this.liToNow, "tonow");
            this.ulYear.appendChild(this.liToNow);
        }

        // add year
        for(var i:number = 0; i <= period; i++){
            var liYear = document.createElement("li");
            liYear.innerHTML = (this.startYear + i).toString();
            if(this.startYear + i < Math.floor(this.enableStart/100) || this.startYear + i > Math.floor(this.enableEnd/100)){
                this.addClass(liYear, "disabled")
            }
            this.yearElements.push(liYear);
            if(i == 0){
                this.ulYear.appendChild(liYear);
            }else{
                this.ulYear.insertBefore(liYear, this.ulYear.childNodes[this.hasToNow?1:0]);
            }
        }

        var initActiveYear:number = this.nowDate.getUTCFullYear();
        if(Math.floor(this.enableStart/100)>this.nowDate.getUTCFullYear()){
            initActiveYear = Math.floor(this.enableStart/100);
        }
        if(Math.floor(this.enableEnd/100) < this.nowDate.getUTCFullYear()){
            initActiveYear = Math.floor(this.enableEnd/100);
        }
        this.setActiveYear(initActiveYear);
        this.selectYear = initActiveYear;
    }

    private setActiveToNow(){
        for(var idx in this.yearElements){
            var ele:HTMLElement = this.yearElements[idx];
            this.removeClass(ele, "active");
        };
        this.addClass(this.liToNow, "active");
    }

    private removeActiveToNow(){
        this.removeClass(this.liToNow, "active");
    }

    private isActiveToNow():boolean{
        if(!this.hasToNow){
            return false;
        }
        var cls:string = this.liToNow.getAttribute("class");
        return cls.indexOf("active") > 0;
    }

    private setActiveYear(year:number){
        if(this.hasToNow) {
            this.removeActiveToNow();
        }
        for(var idx in this.yearElements){
            var ele:HTMLElement = this.yearElements[idx];
            if(ele.innerHTML == year.toString()){
                //debugger;
                this.addClass(ele, "active");
            }else{
                this.removeClass(ele, "active");
            }
        };
    }

    private getActiveYear():number{
        for(var i:number; i < this.yearElements.length; i++){
            var ele:HTMLElement = this.yearElements[i];
            var cls:string = ele.getAttribute("class");
            if(cls.indexOf("active")){
                return parseInt(ele.innerHTML);
            }
        };
        return null;
    }

    private setActiveMonth(month:number){
        for(var idx in this.monthElements){
            var ele:HTMLElement = this.monthElements[idx];
            if(this.getMonthNumber(this.trim(ele.innerHTML)) == month){
                this.addClass(ele, "active");
            }else{
                this.removeClass(ele, "active");
            }
        };
    }

    private clearYearElements(){
        this.removeAllChild(this.ulYear);
        this.yearElements = [];
    }

    private clearMonthElements(){
        this.removeAllChild(this.ulMonth);
        this.monthElements = [];
    }

    private update(option:{lang:string;hasToNow:boolean;
            startYear:number; endYear:number;
            startEnabled:number; endEnabled:number}){
        if(option){
            if(option.lang){
                if(option.lang == "en-US"){
                    this.lang = "en-US";
                }else{
                    this.lang = "zh-CN";
                }
            }
            this.hasToNow = !!option.hasToNow;
            if(option.startYear && option.endYear){
                if(option.startYear<1000 || option.endYear>9999){
                    throw Error("year should be YYYY");
                }
                if(option.startYear > option.endYear){
                    throw Error("param should be `startYear` < `endYear`");
                }else{
                    this.startYear = option.startYear;
                    this.endYear = option.endYear;
                }
            }
            if(!option.startEnabled){
                option.startEnabled = this.startYear*100+1;
            }
            if(!option.endEnabled){
                option.endEnabled = this.endYear*100+12;
            }
            if(option.startEnabled && option.endEnabled){
                if(option.startEnabled<100000 || option.endEnabled>999999){
                    throw Error("year-month should be YYYYMM");
                }
                if(!(option.startEnabled%100>0 && option.startEnabled%100<13 && option.endEnabled%100>0 && option.endEnabled%100<13)){
                    throw Error("illegal month, range 1-12");
                }
                if(option.startEnabled > option.endEnabled){
                    throw Error("param should be `startEnabled` < `endEnabled`");
                }else{
                    this.enableStart = option.startEnabled;
                    this.enableEnd = option.endEnabled;
                }
            }
        };

        this.clearYearElements();
        this.updateYearli();
        this.clearMonthElements();
        this.updateMonthli();
    }

    /**
     * 添加类
     * @param dom
     * @param className
     */
    private addClass(dom:HTMLElement, className:string){
        var old_class_name = dom.className;
        var new_class_name:string;
        var arr = old_class_name.split(/ +/);
        new_class_name = "";
        arr.push(className);
        for(var idx in arr){
            var ele = arr[idx];
            if(ele != ""){
                new_class_name = new_class_name + ele + " ";
            }
        }
        new_class_name = this.trim(new_class_name);
        dom.className = new_class_name
    }

    /**
     * 移除类
     * @param dom
     * @param className
     */
    private removeClass(dom:HTMLElement, className:string){
        var old_class_name = dom.className;
        var new_class_name:string = "";
        var arr = old_class_name.split(/ +/);

        for(var idx in arr){
            var ele = arr[idx];
            if(ele != className && ele != ""){
                new_class_name = new_class_name + ele + " ";
            }
        }
        new_class_name = this.trim(new_class_name);
        dom.className = new_class_name
    }

    /**
     * 是否有某个class
     * @param dom
     * @param cls
     */
    private hasClass(dom:HTMLElement,cls:string):boolean{
        var clses:string = "";
        if(dom.className){
            clses = dom.className;
        }else{
            if(dom.getAttribute("class")){
                clses = dom.getAttribute("class");
            }
        }
        return clses.indexOf(cls) >= 0;
    }

    /**
     * 删除子节点
     * @param div
     */
    private removeAllChild(ele:HTMLElement){
        while(ele.hasChildNodes()){
            ele.removeChild(ele.firstChild);
        }
    }

    /**
     * 移除节点递并归移除子节点
     * @param div
     */
    private removeAllChildRecycle(ele:any){
        while(ele.hasChildNodes()){
            this.removeAllChildRecycle(ele.firstChild);
        }
        this.removeNode(ele);
    }

    /**
     * 封装移除dom节点
     * @param element
     */
    private removeNode(element:any){
        if(element.remove){
            element.remove();
        }else if(element.removeNode){
            element.removeNode();
        }else{
            element.outerHTML = "";
        }
    }

    /**
     * 获取系统语言
     * @returns {string}
     */
    private getSysLang():string{
        if(navigator.language){
            if (navigator.language.indexOf("en") >= 0) {
                return "en-US";
            } else {
                return "zh-CN";
            }
        }else{
            return "zh-CN";
        }
    }

    private trim(content:string):string{
        return content.replace(/^\s+|\s+$/g, '');
    }

    private addEventListener(element:any, event:string, handler:Function):void{
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else {
            element.attachEvent("on"+event, handler);
        }
    }
}
