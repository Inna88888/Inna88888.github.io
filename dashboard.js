/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 87.97624536992465, "KoPercent": 12.023754630075349};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8784837433372351, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8948269742679681, 500, 1500, "2 Review"], "isController": false}, {"data": [0.8810511756569848, 500, 1500, "3 Books"], "isController": false}, {"data": [0.8863386427329809, 500, 1500, "1 Details"], "isController": false}, {"data": [0.8863386427329809, 500, 1500, "Details"], "isController": true}, {"data": [0.8911539280391739, 500, 1500, "1 Review"], "isController": false}, {"data": [0.8678261794585395, 500, 1500, "1 Login"], "isController": false}, {"data": [0.8904968944099378, 500, 1500, "Add Review"], "isController": true}, {"data": [0.8676100294357556, 500, 1500, "Login"], "isController": true}, {"data": [0.8613928090206369, 500, 1500, "1 Home"], "isController": false}, {"data": [0.8614173786648704, 500, 1500, "Home"], "isController": true}, {"data": [1.0, 500, 1500, "HTTP Request"], "isController": false}, {"data": [0.8748913987836664, 500, 1500, "2 Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 394702, 47458, 12.023754630075349, 20.089847530542247, 1, 1253, 39.0, 40.0, 62.0, 1067.275608265598, 8208.009259564398, 123.33554850373963], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["2 Review", 56350, 5914, 10.495119787045253, 23.484117125111165, 1, 1138, 47.0, 80.0, 156.0, 152.4060410671398, 1373.2677621245293, 16.784928131153038], "isController": false}, {"data": ["3 Books", 56394, 6704, 11.887789481150477, 18.814927119906315, 1, 910, 40.0, 61.0, 114.0, 152.51349509416818, 1805.4818886590501, 16.272942843273007], "isController": false}, {"data": ["1 Details", 56378, 6395, 11.343077086806911, 25.88805917201743, 2, 975, 53.0, 87.0, 160.0, 152.47847159115497, 1364.341950106019, 16.633811375235297], "isController": false}, {"data": ["Details", 56378, 6395, 11.343077086806911, 25.888130121678685, 2, 975, 53.0, 87.0, 160.0, 152.4780592029642, 1364.3382601522671, 16.63376638798361], "isController": true}, {"data": ["1 Review", 56364, 6127, 10.870413739266198, 24.31055283514295, 2, 1235, 49.0, 82.0, 162.0, 152.4430813170407, 1369.3632118807777, 22.291481569381563], "isController": false}, {"data": ["1 Login", 56403, 7453, 13.213836143467546, 13.422140666276688, 1, 980, 38.0, 42.0, 83.0, 152.53618485104172, 691.3834501253151, 16.03042735580148], "isController": false}, {"data": ["Add Review", 56350, 6127, 10.873114463176575, 47.76173913043522, 3, 1255, 92.0, 134.0, 223.0, 152.40439227565318, 2742.238089814802, 39.0698953994699], "isController": true}, {"data": ["Login", 56394, 7453, 13.215944958683547, 45.76415930772787, 4, 1252, 112.0, 119.0, 181.9900000000016, 152.51060791679174, 3190.650044005276, 52.367604502178374], "isController": true}, {"data": ["1 Home", 56404, 7812, 13.850081554499681, 21.166601659456717, 1, 1253, 41.900000000001455, 67.0, 132.0, 152.51909057477232, 911.3980098380006, 15.269544516732646], "isController": false}, {"data": ["Home", 56414, 7812, 13.847626475697522, 21.18686850781718, 1, 1253, 41.900000000001455, 67.0, 132.0, 152.513963459802, 911.3830003071826, 15.269466345425986], "isController": true}, {"data": ["HTTP Request", 10, 0, 0.0, 135.0, 10, 269, 268.2, 269.0, 269.0, 9.24214417744917, 60.57034138170055, 1.0740382393715342], "isController": false}, {"data": ["2 Login", 56399, 7053, 12.505540878384368, 13.530151243816483, 1, 1247, 38.0, 46.0, 88.9900000000016, 152.5266047354401, 694.0197738555231, 20.069978990034212], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 47458, 100.0, 12.023754630075349], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 394702, 47458, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 47458, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["2 Review", 56350, 5914, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 5914, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["3 Books", 56394, 6704, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 6704, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["1 Details", 56378, 6395, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 6395, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["1 Review", 56364, 6127, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 6127, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["1 Login", 56403, 7453, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 7453, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1 Home", 56404, 7812, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 7812, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2 Login", 56399, 7053, "Non HTTP response code: java.net.BindException\/Non HTTP response message: Address already in use: connect", 7053, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
