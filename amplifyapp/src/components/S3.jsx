import { getUrl } from 'aws-amplify/storage';
import React, { useEffect, useState } from 'react';

export function S3(props) {
  const [url, setUrl] = useState('');

	console.log('props:', props);

  useEffect(() => {
    async function fetchUrl() {
			if (!props.image) return;
      try {
				console.log('画像URL取得中...');
				console.log('画像:', props.image);
        const url = await getUrl(props.image);
				console.log('取得したURL:', url);
        setUrl(url);
      } catch (error) {
        console.error(error);
      }
    }

		fetchUrl();
  }, [props.image]);

  return (
    <div>
      <p>title={props.title}</p>
      <p>description={props.description}</p>
      {props.image && <img src={url} alt={props.title}/>}
    </div>
  );
}
