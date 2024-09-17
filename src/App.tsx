import { useAsyncList } from 'react-stately';
import { useInView } from 'react-intersection-observer';
import { useEffect, useRef } from 'react';

const BASE_API_URL = 'https://api.pexels.com/v1/';
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const query = 'Nature';

type ImageSource = {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
};

type ImageItem = {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: ImageSource;
    liked: boolean;
    alt: string;
};

function App() {
    const list = useAsyncList<ImageItem>({
        async load({ signal, cursor }) {
            const res = await fetch(
                cursor || BASE_API_URL + 'search?query=' + query,
                {
                    signal,
                    headers: {
                        Authorization: API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const json = await res.json();
            return {
                items: json.photos,
                cursor: json.next_page,
            };
        },
    });

    const { ref, inView } = useInView({
        rootMargin: '1000px', // Whenever last item is 1000px from the current view this is triggered
    });
    const listRef = useRef(list);

    useEffect(() => {
        listRef.current = list;
    }, [list]);

    useEffect(() => {
        if (
            listRef.current.items.length &&
            inView &&
            !listRef.current.isLoading
        ) {
            console.log('loading');
            list.loadMore();
        }
    }, [inView]);

    return (
        <main>
            {list.items.map((item) => (
                <div
                    key={item.id}
                    className="item"
                    style={{
                        aspectRatio: item.width / item.height,
                    }}
                >
                    <img src={item.src.original} alt={item.alt} />
                </div>
            ))}
            <div className="loading" ref={ref}></div>
        </main>
    );
}

export default App;
