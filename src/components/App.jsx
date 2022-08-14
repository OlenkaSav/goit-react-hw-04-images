import React, { useEffect, useState } from 'react';
import Searchbar from './Searchbar';
import ImageGallery from './ImageGallery';
import Loader from 'components/Loader';
import Button from 'components/Button';
import Modal from 'components/Modal';
import fetchImages from 'services/fetchImages';
import styled from 'styled-components';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Status = {
  START: 'start',
  LOADING: 'loading',
  SUCCSESS: 'succsess',
  FAIL: 'fail',
};
// const INITIAL_STATE = {
//   showBtn: false,
//   queryList: [],
//   page: 1,
// };
function App() {
  const [query, setQuery] = useState('');
  const [showBtn, setShowBtn] = useState(false);
  const [queryList, setQueryList] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(Status.START);
  const [loaderActive, setLoaderActive] = useState(false);
  const [largeImage, setLargeImage] = useState(null);
  const [tags, setTags] = useState(null);
  // state = {
  //   query: '',
  //   // page: 1,
  //   // queryList: [],
  //   status: Status.START,
  //   loaderActive: false,
  //   // showBtn: false,
  //   largeImage: null,
  //   tags: null,
  //   ...INITIAL_STATE,
  // };

  const handleFormSubmit = query => {
    if (query.trim() === '') {
      toast.warn('Nothing to search');
      setStatus(status.START);
      setShowBtn(false);
      setPage(1);
      setQueryList([]);
      return;
    }
    setQuery(query);
    setShowBtn(false);
    setPage(1);
    setQueryList([]);
  };
  useEffect(() => {
    if (!query) return;
    // const prevQuery = prevState.query;
    // const nextQuery = this.state.query;
    // const prevPage = prevState.page;
    // const nextPage = this.state.page;
    // console.log(prevQuery, nextQuery);
    // if (prevQuery !== nextQuery || prevPage !== nextPage) {
    const getData = async () => {
      try {
        setLoaderActive(true);
        const searchResult = await fetchImages(query, page);
        console.log(searchResult);
        if (searchResult.total === 0) {
          toast(`Sorry, there are no images.`);
          setStatus(Status.FAIL);
          setShowBtn(false);
          setQueryList([]);
        }
        if (page === 1) {
          setQueryList([...searchResult.hits]);
        } else {
          setQueryList(prevQueryList => {
            return [...prevQueryList, ...searchResult.hits];
          });
        }
        if (searchResult.hits.length > 0 && searchResult.hits.length < 12) {
          toast.info(`Seams thats all...`);
          setShowBtn(false);
          setStatus(Status.SUCCSESS);
        } else if (searchResult.hits.length === 0) {
          console.log('ff');
        } else {
          setShowBtn(true);
          setStatus(Status.SUCCSESS);
        }

        // console.log(searchResult.hits);
      } catch (error) {
        setStatus(Status.FAIL);
      } finally {
        setLoaderActive(false);
      }
    };
    getData();
  }, [page, query]);

  const openModal = (largeImageURL, tags) => {
    setLargeImage(largeImageURL);
    setTags(tags);
  };

  const closeModal = () => {
    setLargeImage(null);
    setTags(null);
  };

  const loadMore = () => {
    setPage(prevPage => {
      return prevPage + 1;
    });

    // console.log(prevState.page);
  };

  return (
    <StyledApp>
      <Searchbar onSubmit={handleFormSubmit} />
      {status === 'start' && (
        <StyledNotification>Type something...</StyledNotification>
      )}
      {status === 'fail' && (
        <StyledNotification>There is nothing...</StyledNotification>
      )}
      {status === 'succsess' && (
        <ImageGallery queryList={queryList} openModal={openModal} />
      )}
      {status === 'loading' && (
        <StyledNotification>Search {query}</StyledNotification>
      )}
      {loaderActive && <Loader />}
      {showBtn && <Button loadMore={loadMore}>Load more</Button>}
      {largeImage?.length > 0 && (
        <Modal onClose={closeModal} large={largeImage} tags={tags} />
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </StyledApp>
  );
}

const StyledApp = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding-bottom: 24px;
`;
const StyledNotification = styled.h2`
  font-size: 40px;
  text-align: center;
  margin-top: 20px;
`;

export default App;
