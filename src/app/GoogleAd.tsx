import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

const GoogleAd = () => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  }, []);

  return (
    <div className="googleAd-container">
        <ins className="adsbygoogle"
            style={{ display:"block"}}
            data-ad-client="ca-pub-2865579941111232"
            data-ad-slot="2792041992"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    </div>
  );
};

export default GoogleAd;