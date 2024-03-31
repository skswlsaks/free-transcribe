'use client'
import React, { useState } from 'react';
import { Button, List, Divider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranscriber } from './useTranscriber';
import FileTile from './FileTile';
import GoogleAd from './GoogleAd';

enum AudioSource {
    URL = "URL",
    FILE = "FILE",
    RECORDING = "RECORDING",
}

const Home: React.FC = () => {
    const transcriber = useTranscriber();
    const [audioData, setAudioData] = useState<
        | {
              buffer: AudioBuffer;
              url: string;
              source: AudioSource;
              mimeType: string;
          }
        | undefined
    >(undefined);

    const startTranscribe = () =>{
        if (audioData && (!transcriber.isBusy)) {
            transcriber.start(audioData.buffer)
        }
    }

    return (
    <div className='flex items-center min-h-screen' style={{ flexDirection: "row", justifyContent: "space-between"}}>
        <div style={{ width: "90px", height: "728px", marginLeft: "20px" }}>
            <GoogleAd />
        </div>
        <div className='container flex flex-col justify-center items-center z-10'>
            <div style={{ width: "728px", height: "90px", marginTop: "20px" }}>
                <GoogleAd />
            </div>
            <h1
                className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-5xl text-center'
                style={{color: "white"}}
            >
                Free Speech to Text Service
            </h1>
            <br />
            <br />
            <FileTile
                onFileUpdate={(decoded, blobUrl, mimeType) => {
                    transcriber.onInputChange();
                    setAudioData({
                        buffer: decoded,
                        url: blobUrl,
                        source: AudioSource.FILE,
                        mimeType: mimeType,
                    });
                }}
            />
            {
                audioData && (
                    <div className='my-10'>
                        <Button
                            loading={transcriber.isBusy}
                            onClick={startTranscribe}
                        >
                            Transcribe
                        </Button>
                    </div>
                )
            }
            {
                transcriber.output && (
                    <div className='transcribe-result-list'>
                        <InfiniteScroll
                            dataLength={transcriber.output.chunks.length}
                            next={() => {}}
                            loader={<div></div>}
                            hasMore={transcriber.isBusy}
                            endMessage={<Divider plain style={{ color: "white" }}>Transcribe Finished! 😀</Divider>}
                            scrollableTarget="scrollableDiv"
                            style={{ display: "flex", flexDirection: "column" }}
                            inverse={true}
                        >
                        <List
                            itemLayout="horizontal"
                            dataSource={transcriber.output.chunks}
                            renderItem={(item) => (
                                <List.Item className='my-2 transcribe-result-item' >
                                    <div style={{padding: "0 10px"}}>{item.text}</div>
                                </List.Item>
                                )
                            }
                        />
                        </InfiniteScroll>
                    </div>
                )
            }
        </div>
        <div style={{ width: "90px", height: "728px", marginRight: "20px" }}>
            <GoogleAd />
        </div>
    </div>
  );
}

export default Home;