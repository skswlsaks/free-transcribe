'use client'
import React, { useState } from 'react';
import { Button } from 'antd';
import { useTranscriber } from './useTranscriber';
import FileTile from './FileTile';

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
      <div className='flex justify-center items-center min-h-screen'>
          <div className='container flex flex-col justify-center items-center z-10'>
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
              )}
              {
                  transcriber.output && (
                      <div>
                          {
                              transcriber.output.chunks.map((chunk, i) => (
                                  <div
                                      key={`${i}-${chunk.text}`}
                                      className='w-full flex flex-row mb-2 bg-white rounded-lg p-4 shadow-xl shadow-black/5 ring-1 ring-slate-700/10'
                                      style={{color: "black"}}
                                  >
                                      {/* <div className='mr-5'>
                                          {formatAudioTimestamp(chunk.timestamp[0])}
                                      </div> */}
                                      {chunk.text}
                                  </div>
                              ))
                          }
                      </div>
                  )
              }
          </div>
      </div>
  );
}

export default Home;