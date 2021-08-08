import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
    StockSymbol,
    RateChange,
    RawChange,
    LastClose,
    AssetNameHeading,
} from "./style/AssetInfoStyle";

import "./_assetInfo.scss";

import { dateLastRefresh } from "../../utils/DateFunctions";
import { searchAssetInfoTiingo } from "../../utils/apis/StockApiConnectorTiingo";

export default function AssetInfo({
    ticker,
    dataPeriod,
    startClose,
    lastClose,
    lastDate,
    assetName,
    setAssetName,
}) {
    const [assetEC, setAssetEC] = useState("...");
    const [isApiConsumed, setIsApiConsumed] = useState(false);

    const getStockIncreaseRate = (p1, p2) => {
        let rate = 0;
        const change = Math.abs((p2 - p1).toFixed(2));
        const state = p2 - p1 > 0 ? "increase" : "decrease";
        if (p1 && p2) {
            rate = (100 * (p2 - p1)) / p1;
        }
        rate = Math.abs(rate.toFixed(2));

        return { rate, change, state };
    };

    const getPeriodIndicator = (period) => {
        let result;
        switch (period) {
            case "1W":
                result = "Week";
                break;
            case "1M":
                result = "Month";

                break;
            case "3M":
                result = "3 Months";

                break;

            case "6M":
                result = "6 Months";

                break;
            case "1Y":
                result = "1 Year";

                break;
            case "5Y":
                result = "5 Years";
                break;

            default:
                result = "Unknown";
                break;
        }
        return result;
    };

    const { rate, change, state } = getStockIncreaseRate(startClose, lastClose);
    const periodIndicator = getPeriodIndicator(dataPeriod);

    useEffect(() => {
        async function fetchMyApi() {
            try {
                const res = await searchAssetInfoTiingo(ticker);

                const { data } = res;
                const { name, exchangeCode } = data;
                if (res.statusText === "OK" && name && exchangeCode) {
                    setAssetName(name);
                    setAssetEC(exchangeCode);
                    setIsApiConsumed(true);
                } else {
                    setAssetName("No information found, try another asset !");
                    setAssetEC("...");
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchMyApi();

        return () => {
            setAssetName("Searching...");
            setAssetEC("...");
        };
    }, [ticker]);

    return (
        <>
            {isApiConsumed && (
                <div className="asset-info">
                    <div>
                        <AssetNameHeading>{assetName}.</AssetNameHeading>
                        <StockSymbol state={state}>{ticker}</StockSymbol>
                    </div>

                    <div>
                        <span>${lastClose}</span>
                        <RateChange state={state}>{rate}%</RateChange>
                        <RawChange state={state}>
                            {state === "increase" ? "+" : "-"}
                            {change} {periodIndicator}
                        </RawChange>
                    </div>
                    {/* <CompanyLogo
                        src="https://financialmodelingprep.com/image-stock/AAPL.png"
                        alt="company logo"
                    /> */}

                    <LastClose>
                        Last Refreshed: {dateLastRefresh(lastDate)} · USD ·
                        {assetEC}
                    </LastClose>
                </div>
            )}
        </>
    );
}

AssetInfo.propTypes = {
    ticker: PropTypes.string.isRequired,
    dataPeriod: PropTypes.string.isRequired,
    startClose: PropTypes.number,
    lastClose: PropTypes.number,
    lastDate: PropTypes.string.isRequired,
    assetName: PropTypes.string.isRequired,
    setAssetName: PropTypes.func.isRequired,
};

AssetInfo.defaultProps = {
    startClose: 0,
    lastClose: 0,
};
