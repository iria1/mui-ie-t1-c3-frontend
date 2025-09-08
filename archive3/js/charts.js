// start with 3 countries pre-selected
const allRegions = ['Indonesia', 'Malaysia', 'Singapore'];

let bullyStat = [];
let socmedUsage = [];
let wordCloudNC = [];
let wordCloudNG = [];

let chartInstance = null;
let scatterChart = null;

$(document).ready(function () {
    getBullyStatRegionList();
    getBullyStat();
    getWordCloud();
    getSocmedUsage();
});

//////////////
// API call //
//////////////

function getBullyStatRegionList() {
    // get list of countries for combo box
    $.ajax({
        url: `${window.location.origin}/api/v2/charts/get_bully_stat_region_list`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            const data = response.data;
            const select = $('#regionSelect');

            // add combobox options using queried data
            data.forEach(region => {
                const option = $('<option>', {
                    value: region.code,
                    text: region.name
                });
                select.append(option);
            });

            // Important: refresh the Bootstrap Select UI
            select.selectpicker('refresh');

            // change combo box selections
            select.selectpicker('val', allRegions);
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getBullyStat() {
    // get bullying statistics data for bar chart
    $.ajax({
        url: `${window.location.origin}/api/v2/charts/get_bully_stat`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            // data is loaded into variable to eliminate need for re-querying
            // everytime country selection changes
            bullyStat = response.data;

            // draw bar chart
            updateBarChart(allRegions);
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getWordCloud() {
    // get word cloud data
    $.ajax({
        url: `${window.location.origin}/api/v2/charts/get_word_cloud`,
        method: 'GET',
        data: {
            label: 'nc'
        },
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            wordCloudNC = response.data;

            wordCloudChangeSelection('nc');
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });

    $.ajax({
        url: `${window.location.origin}/api/v2/charts/get_word_cloud`,
        method: 'GET',
        data: {
            label: 'ng'
        },
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            wordCloudNG = response.data;
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getSocmedUsage() {
    $.ajax({
        url: `${window.location.origin}/api/v2/charts/get_socmed_usage`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            socmedUsage = response.data;

            // draw scatter plot
            drawScatterPlot('socmed');
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

///////////////////
// Event handler //
///////////////////

// update bar chart when combo box values change
$('#regionSelect').on('changed.bs.select', function () {
    const selectedRegions = $(this).val(); // Array of selected values
    updateBarChart(selectedRegions);
});

/////////////////////
// Helper function //
/////////////////////

function updateBarChart(selectedRegions) {
    // filter data by selected countries
    const filtered = bullyStat.filter(item => selectedRegions.includes(item.country));

    const countries = filtered.map(d => d.country);
    const maleData = filtered.map(d => d.male_pct);
    const femaleData = filtered.map(d => d.female_pct);

    // If chart exists, update data
    if (chartInstance) {
        chartInstance.data.labels = countries;
        chartInstance.data.datasets[0].data = femaleData;
        chartInstance.data.datasets[1].data = maleData;
        chartInstance.update();
    } else {
        // Initial render
        const ctx = document.getElementById('barChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: countries,
                datasets: [
                    {
                        label: 'Female %',
                        data: femaleData,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)'
                    },
                    {
                        label: 'Male %',
                        data: maleData,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cyberbullying Percentages of Asean Countries'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage of cyberbullying victims'
                        }
                    }
                }
            }
        });
    }
}

function drawScatterPlot(name) {
    let xAxisLabel = '';
    if (name == 'socmed') {
        xAxisLabel = 'Average Daily Social Media Usage (Hours)';
    } else if (name == 'sleep') {
        xAxisLabel = 'Sleep Hours per Night';
    }

    const xValues = socmedUsage.map(d => d['x_' + name]);
    const yValues = socmedUsage.map(d => d.y);

    const xMin = Math.ceil(Math.min(...xValues) - 1);
    const xMax = Math.floor(Math.max(...xValues) + 1);
    const yMin = Math.ceil(Math.min(...yValues) - 1);
    const yMax = Math.floor(Math.max(...yValues) + 1);

    const points = socmedUsage.map(item => ({
        x: item['x_' + name],
        y: item.y,
        backgroundColor: 'rgba(255, 0, 0, 1)',
        radius: 6
    }));

    let ctx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChart != null) {
        scatterChart.destroy();
    }

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Mental Health Score',
                data: points,
                parsing: false,
                showLine: false,
                pointBackgroundColor: points.map(p => p.backgroundColor),
                pointRadius: points.map(p => p.radius)
            }]
        },
        options: {
            scales: {
                x: {
                    min: xMin,
                    max: xMax,
                    title: {
                        display: true,
                        text: xAxisLabel
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Mental Health Score'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

function wordCloudChangeSelection(label) {
    const wcNarrationNotCool = document.getElementById('wcNarrationNotCool');
    const wcNarrationNoGo = document.getElementById('wcNarrationNoGo');

    // Hide all
    wcNarrationNotCool.classList.add('d-none');
    wcNarrationNoGo.classList.add('d-none');

    let wcData = null;

    // Show selected
    if (label == 'nc') {
        wcData = wordCloudNC;
        wcNarrationNotCool.classList.remove('d-none');
    } else if (label == 'ng') {
        wcData = wordCloudNG;
        wcNarrationNoGo.classList.remove('d-none');
    }

    // helps canvas stretch to appropriate size
    let div = document.getElementById("surroundingDiv");

    let canvas = document.getElementById("wordCloudCanvas");
    canvas.height = div.offsetHeight;
    canvas.width = div.offsetWidth;

    // draw wordcloud
    WordCloud(canvas, {
        list: wcData,
        gridSize: 24,
        weightFactor: 2.5,
        fontFamily: 'Arial',
        color: 'random-dark',
        drawOutOfBound: false,
        shrinkToFit: true,
        rotationSteps: 2
    });
}

// change box content when button is pressed
function switchBox() {
    const box1 = document.getElementById('box1');
    const box2 = document.getElementById('box2');

    // Copy height from box1 to box2
    box2.style.minHeight = box1.offsetHeight + 'px';
    box2.style.maxHeight = box1.offsetHeight + 'px';

    box1.classList.add('d-none');
    box2.classList.remove('d-none');

    // resize images as required
    const caroFinish = $('#caroFinish');
    const caroChamp = $('#caroChamp');

    caroChamp.prop('height', caroFinish.prop('height'));
}

function checkCheckboxStatus() {
    if ($('#resp1').prop('checked') && $('#resp2').prop('checked') && $('#resp3').prop('checked')) {
        $('#btnResp').prop("disabled", false);
    } else {
        $('#btnResp').prop("disabled", true);
    }
}