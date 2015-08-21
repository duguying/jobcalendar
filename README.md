#JobCalender

JobCalender是“开源中国人才汇”简历部分用到的年月选择器控件，控件为单例模式，一次初始化页面到处使用。

## 效果

![demo](https://git.oschina.net/duguying2008/JobCalender/raw/master/shot.png)

## 使用

```html
<input type="text" class="jobcalendar" id="calendar1" 
	data-lang="zh-CN" data-has-to-now="false" data-start-year="1990" data-end-year="2015" />
<input type="text" id="calendar2" 
	data-lang="en-US" data-has-to-now="true" data-start-year="1990" data-end-year="2015" />
```

```javascript
var input1 = document.getElementById("calendar1");
var input2 = document.getElementById("calendar2");
var calendar = JobCalendar.getInstance();
calendar.updateOption({lang:"zh-CN",hasToNow:true,startYear:1990,endYear:2015, startEnabled:199504, endEnabled:200011});

calendar.addBindingElement(input1,function(){
	console.log("here is callback function for calendar1");
	input2.setAttribute("data-start-enabled",input1.value);
});

calendar.addBindingElement(input2);

calendar.removeBindingElement(input2);
```

## License

MIT License
