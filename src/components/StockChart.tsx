import * as React from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Theme } from "../styles";

const getOptions = (data1, data2): Highcharts.Options => {
  return {
    title: {
      text: ""
    },

    xAxis: {
      categories: ["Vuosi 2070"],
      labels: {
        style: {
          color: Theme.color.secondaryLight,
          opacity: 0.6
        }
      },
      lineColor: "rgba(221, 207, 162, 0.1)"
    },

    yAxis: {
      title: {
        text: "CO2-ekvivalentti",
        style: {
          color: Theme.color.secondaryLight,
          opacity: 0.6
        }
      },
      gridLineColor: "rgba(221, 207, 162, 0.3)",
      lineColor: Theme.color.secondaryLight,
      labels: {
        style: {
          color: Theme.color.secondaryLight,
          opacity: 0.6
        }
      }
    },

    legend: {
      align: "right",
      x: 0,
      verticalAlign: "top",
      y: 0,
      backgroundColor: "none",
      borderColor: "none",
      borderWidth: 1,
      shadow: false,
      layout: "vertical",
      itemStyle: {
        color: Theme.color.secondaryLight
      }
    },

    tooltip: {
      headerFormat: "<b>{point.x}</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}"
    },

    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: false
        }
      }
    },

    chart: {
      backgroundColor: "none",
      plotBorderWidth: 0,
      plotBorderColor: "black",
      borderWidth: 0,
      height: 250,
      width: 350
    },
    credits: {
      enabled: false
    },

    series: [
      {
        type: "column",
        name: "Maa",
        legendIndex: 1,
        data: data1,
        borderWidth: 0,
        color: Theme.color.red
      },
      {
        type: "column",
        name: "Puusto",
        legendIndex: 0,
        data: data2,
        borderWidth: 0,
        color: Theme.color.secondary
      }
    ]
  };
};

const StockChart = (props: { data1; data2 }) => (
  <div>
    <HighchartsReact
      highcharts={Highcharts}
      options={getOptions(props.data1, props.data2)}
    />
  </div>
);

export default StockChart;
