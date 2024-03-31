'use client'
import { Button } from "antd";
import Constants from "./Constants";
import { FolderOpenOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";


const FileTile = (props: {
    onFileUpdate: (
        decoded: AudioBuffer,
        blobUrl: string,
        mimeType: string,
    ) => void;
}) => {
    const [elem, setElem] = useState<HTMLInputElement>()
    useEffect(() => {
        let telem = document.createElement("input")
        telem.type = "file";
        telem.oninput = (event) => {
            // Make sure we have files to use
            let files = (event.target as HTMLInputElement).files;
            if (!files) return;

            // Create a blob that we can use as an src for our audio element
            const urlObj = URL.createObjectURL(files[0]);
            const mimeType = files[0].type;

            const reader = new FileReader();
            reader.addEventListener("load", async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer; // Get the ArrayBuffer
                if (!arrayBuffer) return;

                const audioCTX = new AudioContext({
                    sampleRate: Constants.SAMPLING_RATE,
                });

                const decoded = await audioCTX.decodeAudioData(arrayBuffer);

                props.onFileUpdate(decoded, urlObj, mimeType);
            });
            reader.readAsArrayBuffer(files[0]);

            telem.value = "";
        };
        setElem(telem)

    }, [])

    return (
        <>
            <Button
                icon={<FolderOpenOutlined />}
                onClick={() => elem && elem.click()}
            > From Audio File </Button>
        </>
    );
}

export default FileTile;