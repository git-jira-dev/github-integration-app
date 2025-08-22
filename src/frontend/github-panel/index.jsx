import ForgeReconciler, {Text} from "@forge/react";
import React, {useEffect, useState} from "react";
import {invoke} from "@forge/bridge";

const GitHubPanel = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    }, []);
    return (
        <>
            <Text>Hello world!</Text>
            <Text>{data ? data : 'Loading...'}</Text>
        </>
    );
}
ForgeReconciler.render(
    <React.StrictMode>
        <GitHubPanel/>
    </React.StrictMode>
);