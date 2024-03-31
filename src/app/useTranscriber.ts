'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    DEFAULT_MODEL,
    DEFAULT_SUBTASK,
    DEFAULT_MULTILINGUAL,
    DEFAULT_LANGUAGE,
    mobileTabletCheck
} from "./Constants";


interface MessageEventHandler {
    (event: MessageEvent): void;
}

interface ProgressItem {
    file: string;
    loaded: number;
    progress: number;
    total: number;
    name: string;
    status: string;
}

interface TranscriberUpdateData {
    data: [
        string,
        { chunks: { text: string; timestamp: [number, number | null] }[] },
    ];
    text: string;
}

interface TranscriberCompleteData {
    data: {
        text: string;
        chunks: { text: string; timestamp: [number, number | null] }[];
    };
}

function createWorker(messageEventHandler: MessageEventHandler): Worker {
    const worker = new Worker(new URL('../worker.js', import.meta.url), {
        type: "module",
    });
    // Listen for messages from the Web Worker
    worker.addEventListener("message", messageEventHandler);
    return worker;
}

export interface TranscriberData {
    isBusy: boolean;
    text: string;
    chunks: { text: string; timestamp: [number, number | null] }[];
}

export interface Transcriber {
    onInputChange: () => void;
    isBusy: boolean;
    isModelLoading: boolean;
    progressItems: ProgressItem[];
    start: (audioData: AudioBuffer | undefined) => void;
    output?: TranscriberData;
    model: string;
    setModel: (model: string) => void;
    multilingual: boolean;
    setMultilingual: (model: boolean) => void;
    quantized: boolean;
    setQuantized: (model: boolean) => void;
    subtask: string;
    setSubtask: (subtask: string) => void;
    language?: string;
    setLanguage: (language: string) => void;
}

export function useTranscriber(): Transcriber {
    const [transcript, setTranscript] = useState<TranscriberData | undefined>(
        undefined,
    );
    const [isBusy, setIsBusy] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);

    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

    const [model, setModel] = useState<string>(DEFAULT_MODEL);
    const [subtask, setSubtask] = useState<string>(DEFAULT_SUBTASK);
    const [quantized, setQuantized] = useState<boolean>(false);
    const [multilingual, setMultilingual] = useState<boolean>(DEFAULT_MULTILINGUAL);
    const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);

    const workerRef = useRef<Worker>()
    useEffect(() => {
        let webWorker
        if (!workerRef.current) {
            webWorker = createWorker((event) => {
                const message = event.data;
                // Update the state with the result
                switch (message.status) {
                    case "progress":
                        // Model file progress: update one of the progress items.
                        setProgressItems((prev) =>
                            prev.map((item) => {
                                if (item.file === message.file) {
                                    return { ...item, progress: message.progress };
                                }
                                return item;
                            }),
                        );
                        break;
                    case "update":
                        // Received partial update
                        // console.log("update", message);
                        // eslint-disable-next-line no-case-declarations
                        const updateMessage = message as TranscriberUpdateData;
                        setTranscript({
                            isBusy: true,
                            text: updateMessage.data[0],
                            chunks: updateMessage.data[1].chunks,
                        });
                        break;
                    case "complete":
                        // Received complete transcript
                        // console.log("complete", message);
                        // eslint-disable-next-line no-case-declarations
                        const completeMessage = message as TranscriberCompleteData;
                        setTranscript({
                            isBusy: false,
                            text: completeMessage.data.text,
                            chunks: completeMessage.data.chunks,
                        });
                        setIsBusy(false);
                        break;

                    case "initiate":
                        // Model file start load: add a new progress item to the list.
                        setIsModelLoading(true);
                        setProgressItems((prev) => [...prev, message]);
                        break;
                    case "ready":
                        setIsModelLoading(false);
                        break;
                    case "error":
                        setIsBusy(false);
                        alert(
                            `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
                        );
                        break;
                    case "done":
                        // Model file loaded: remove the progress item from the list.
                        setProgressItems((prev) =>
                            prev.filter((item) => item.file !== message.file),
                        );
                        break;

                    default:
                        // initiate/download/done
                        break;
                }
            });
            workerRef.current = webWorker
            setQuantized(mobileTabletCheck())
        }
    }, [])



    const onInputChange = useCallback(() => {
        setTranscript(undefined);
    }, []);

    const postRequest = async (audioData: AudioBuffer | undefined) => {
        if (audioData && workerRef.current) {
            setTranscript(undefined);
            setIsBusy(true);
            workerRef.current.postMessage({
                audio: audioData.getChannelData(0),
                model,
                multilingual,
                quantized,
                subtask: multilingual ? subtask : null,
                language:
                    multilingual && language !== "auto" ? language : null,
            });
        }
    }

    const transcriber = useMemo(() => {
        return {
            onInputChange,
            isBusy,
            isModelLoading,
            progressItems,
            start: postRequest,
            output: transcript,
            model,
            setModel,
            multilingual,
            setMultilingual,
            quantized,
            setQuantized,
            subtask,
            setSubtask,
            language,
            setLanguage,
        };
    }, [
        onInputChange,
        isBusy,
        isModelLoading,
        progressItems,
        postRequest,
        transcript,
        model,
        multilingual,
        quantized,
        subtask,
        language,
    ]);

    return transcriber;
}
