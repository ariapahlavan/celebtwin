import React from 'react';


const formStyle = {
  background: 'linear-gradient(to right, rgb(219, 197, 193), rgb(180, 214, 203))'
};

const ImageLinkForm = ({onInputChange, onDetectClick}) => {
  return (
    <div className='ph4-l'>
      <div className='mw7 center ph2'>
        <fieldset className="cf bn ma0 pa0">
          <p className='f3'>
            {'Find out who\'s your celebrity look-alike!'}
          </p>
          <div className='center pa4 br3  shadow-5'
               style={formStyle}>

            <input className='f4 pa2 w-70 center'
                   type='text'
                   placeholder='Image URL'
                   onChange={onInputChange}/>

            <input className='w-30 grow f4 link pa2 dib bg-washed-red'
                   onClick={onDetectClick}
                   type="submit"
                   value="detect"
            />
          </div>
        </fieldset>
      </div>
    </div>



  );
};
export default ImageLinkForm;
