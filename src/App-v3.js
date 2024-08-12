import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const KEY = '9067ef3';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({children}) {  
  return (
    <nav className="nav-bar">
      {children}       
    </nav>
  );
};

function Logo() {
  return (
    <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
  );
};    

function Search({query, setQuery}) {  
  const inputEl = useRef(null);

  useEffect(function() {

    function callback(e) {
      if (document.activeElement === inputEl.current) return;
      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery('');
      }      
    }

    document.addEventListener('keydown', callback)
    return () => {document.removeEventListener('keydown', callback)}
  }, 
  [setQuery])

  return (
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputEl}
        />
  );
};

function NumResults({children}) {
  return (
    <p className="num-results">
      Found <strong>{children}</strong> results
    </p>
  )
}

function Main({children}) {
  return (
    <main className="main">
      {children}     
    </main>
  )
}

function Button({isOpen, setIsOpen}) {
  return ( 
    <button 
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
  )
}

function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <Button isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && children }
    </div>
  );
};

function MovieList({movies, onSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/> ))}           
    </ul>
  );
};

function Loader() {
  return (
    <p className="loader">Loading...</p>
  )
};

function ErrorMessage({message}) {
  return <p className="error">
    <span>🛑</span> {message}
  </p>
} 

function Movie({movie, onSelectMovie}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)} key={movie.imdbID}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
  );
};

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0)
  
  useEffect(function() {
    console.log(`current value of countRef is ${countRef.current} (before checking if userRating exists)`)
    if (userRating) countRef.current = countRef.current + 1;
    console.log(`current value of countRef is ${countRef.current} (after countRef increments by 1)`)
  }, [userRating])

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating

  const { 
    Title: title, 
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  };

  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      console.log(data);
      setMovie(data);
      setIsLoading(false);
    }    
    getMovieDetails();
  }, [selectedId]);

  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function() {
      document.title = "usePopcorn";
      //The following title variable is still available to JS because of closures. Cleanup will run after rerenders and after unmounting.
      console.log(`Cleanup effect successful for movie ${title}`)
    }
  }, [title])

  useEffect(function() {
    function callback (e) {
      if(e.code === 'Escape') {
        onCloseMovie();
        console.log("CLOSING");
      };
    };

    document.addEventListener('keydown', callback);
    //Cleanup effect to remove Escape key listener
    return function() {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie]
);

  return (
    
    
    <div className="details">
      {isLoading ? <Loader /> :
      <>
      <header>
        <button className="btn-back" onClick={onCloseMovie}>X</button>
      
        <img src={poster} alt={`${title} movie poster`}/>
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p><span>⭐</span>{imdbRating} IMDb Rating</p>
        </div>
      </header>
      <section>
        <div className="rating" >
          {!isWatched ? (
          <>
          <StarRating 
            size={25}
            onSetRating={setUserRating} 
          />

          {userRating > 0 && (
            <button className="btn-add" onClick={handleAdd}>
            + Add to List
          </button> 
          )}
          </>
          ) : (
          <p>You have rated this movie {watchedUserRating}<span>⭐</span></p>
          )} 
        </div>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section> 
      </>
      }
    </div>
    
  )
}

function WatchedList({watched, onDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map((movie) => ( 
        <WatchedMovie 
          movie={movie} 
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched} /> ))}
    </ul>
  )
};

function WatchedMovie({movie, onDeleteWatched}) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>❌</button>
      </div>
    </li>
  );
};

function Summary({children, watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>{children}</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);    
  const {movies, isLoading, error} = useMovies(query, handleCloseMovie);

  const [watched, setWatched] = useLocalStorageState([], "watched")
  

function handleSelectMovie(id) {
  setSelectedId((selectedId) => (id === selectedId ? null : id));
};

function handleCloseMovie() {
  setSelectedId(null);
}

function handleAddWatched(movie) {
  setWatched(watched => [...watched, movie]);
  // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  console.log("setWatched updated...");
}

function handleDeleteWatched(id) {
  setWatched(watched => watched.filter((movie) => movie.imdbID !== id));
  console.log("Movie deleted");
}





  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </ NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
          {error && <ErrorMessage message={error} /> }
        </ Box>
        <Box >
          {selectedId ?
            <MovieDetails 
              selectedId={selectedId} 
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
              /> :
            <>
              <Summary watched={watched} />
              <WatchedList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          }
        </Box>
      </ Main>    
    </>
  );
}
