import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// import StarRating from './StarRating';

// function Test() {
//   const [testRating, setTestRating] = useState(0);

//   return (
//     <div>
//       <StarRating maxRating={5} onSetRating={setTestRating} />
//       <p>This movie was rated {testRating} stars.</p>
//     </div>
//   );
// };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5}/>
    <StarRating maxRating={24} color="blue" size="24" defaultRating="7"/>
    <StarRating 
      color="green" 
      size="72" 
      className="text"
      defaultRating="0"
     />
     <StarRating 
      color="red"
      maxRating={5}
      size="100" 
      className="text"
      defaultRating="1"
      messages={['Okay', 'Average', 'Good', 'Great', 'Amazing']}  
     />
     <Test /> */}
  </React.StrictMode>
);