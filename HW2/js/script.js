// Объявляем основные переменные
const width = 1000;
const height = 500;
const margin = 60;
const svg  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

// Указываем изначальные значения, на основе которых будет строится график
let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let radius = 'gdp';
let year = '2000';
    //$('slider').getAttribute('Value');

// Эти переменные понадобятся в Part 2 и 3
const params = ['child-mortality', 'fertility-rate', 'gdp', 'life-expectancy', 'population'];
const colors = ['aqua', 'lime', 'gold', 'hotpink'];

// Создаем шкалы для осей и точек
const x = d3.scaleLinear()
    .range([margin*2, width-margin]);

const y = d3.scaleLinear()
    .range([height-margin, margin]);

// Создаем наименования для шкал и помещаем их на законные места сохраняя переменные
const xLable = svg.append('text')
    .attr('transform', `translate(${width/2 - 2*margin}, ${height - 10})`);
const yLable = svg.append('text')
    .attr('transform', `translate(${margin/2}, ${height/2 + margin}) rotate(-90)`);

// Part 1: по аналогии со строчками сверху задайте атрибуты 'transform' чтобы переместить оси
const xAxis = svg.append('g')
    .attr('transform', `translate(0, ${height - margin})`);// .attr('transform', ...

const yAxis = svg.append('g')
    .attr('transform', `translate(${2*margin}, 0)`);// .attr('transform', ...



// Part 2: Здесь можно создать шкалы для цвета и радиуса объектов
const color = d3.scaleOrdinal()
    .range(colors);
const r = d3.scaleSqrt()
    .range([5, 30]);

// Part 2: для элемента select надо задать options http://htmlbook.ru/html/select
// и установить selected для дефолтного значения

const sel_r = d3.select('#radius');
params.forEach(function(d) {
    let opt = sel_r.append('option')
        .attr('id', d);
    if (d === radius) {
        document.querySelector('#radius #' + d).selected = true;
    }
    document.querySelector('#radius #' + d).innerHTML = d;
});
// Part 3: то же что делали выше, но для осей
// ...

const sel_x = d3.select('#xParam');
params.forEach(function(d) {
    let opt = sel_x.append('option')
        .attr('id', d);
    if (d === xParam) {
        document.querySelector('#xParam #' + d).selected = true;
    }
    document.querySelector('#xParam #' + d).innerHTML = d;
});

const sel_y = d3.select('#yParam');
params.forEach(function(d) {
    let opt = sel_y.append('option')
        .attr('id', d);
    if (d === yParam) {
        document.querySelector('#yParam #' + d).selected = true;
    }
    document.querySelector('#yParam #' + d).innerHTML = d;
});

loadData().then(data => {
    // сюда мы попадаем после загружки данных и можем для начала на них посмортеть:
    console.log(data);

    // Part 2: здесь мы можем задать пораметр 'domain' для цветовой шкалы
    // для этого нам нужно получить все уникальные значения поля 'region', сделать это можно при помощи 'd3.nest'
    let regions = d3.nest()
        .key(d => d.region)
        .entries(data);

    // подписка на изменение позиции ползунка
    d3.select('.slider').on('change', newYear);

    // подписка на событие 'change' элемента 'select'
    d3.select('#radius').on('change', newRadius);
    d3.select('#xParam').on('change', newX);
    d3.select('#yParam').on('change', newY);

    // изменяем значение переменной и обновляем график
    function newYear(){
        year = this.value;
        updateChart();
    }

    function newRadius(){
        radius = this.value;
        updateChart();
    }

    function newX(){
        xParam = this.value;
        updateChart();
    }

    function newY(){
        yParam = this.value;
        updateChart();
    }

    function updateChart(){
        // Обновляем все лейблы в соответствии с текущем состоянием
        xLable.text(xParam);
        yLable.text(yParam);
        d3.select('.year').text(year);

        // обновляем параметры шкалы и ось 'x' в зависимости от выбранных значений
        // P.S. не стоит забывать, что значения показателей изначально представленны в строчном формате, по этому преобразуем их в Number при помощи +
        let xRange = data.map(d => +d[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)])
            .nice();

        xAxis.call(d3.axisBottom(x)
            .tickSize(-height + 2 * margin)
        );

        let yRange = data.map(d => +d[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)])
            .nice();

        yAxis.call(d3.axisLeft(y)
            .tickSize(-width + 2 * margin)
        );

        let rRange = data.map(d => +d[radius][year]);
        r.domain([d3.min(rRange), d3.max(rRange)]);
        // Part 2: теперь у нас есть еще одна не постоянная шкала
        // ...
        console.log(year);
        console.log(data);
        xData = d => +d[xParam][year];
        yData = d => +d[yParam][year];
        colorData = d => d['region'];
        radData  = d => d[radius][year];

        svg.selectAll('circle').remove();

        svg.selectAll('circle').data(data)
            .enter()
            .append('circle')
                .attr('cx', d => x(xData(d)))
                .attr('cy', d => y(yData(d)))
                .attr('r', d => r(radData(d)))
                .attr('fill', d => color(colorData(d)));
    }

    // рисуем график в первый раз
    updateChart();
});

// Эта функция загружает и обрабатывает файлы, без особого желания лучше ее не менять
async function loadData() {
    const population = await d3.csv('data/pop.csv');
    const rest = { 
        'gdp': await d3.csv('data/gdppc.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expect.csv'),
        'fertility-rate': await d3.csv('data/tfr.csv')
    };
    const data = population.map(d=>{
        return {
            geo: d.geo,
            country: d.country,
            region: d.region,
            population: {...d},
            ...Object.values(rest).map(v=>v.find(r=>r.geo===d.geo)).reduce((o, d, i)=>({...o, [Object.keys(rest)[i]]: d }), {})
            
        }
    });
    return data
}