// BIBLIOTECAS REACT
import { Image, Modal, message, Skeleton, Typography } from 'antd';

// CSS
import './styles.css';

// INTERFACE
interface CardTypeInterface {
  item: any;
  typeProdSelect: any;
  setTypeProdSelect: any;
}

const CardType = ({
  item,
  typeProdSelect,
  setTypeProdSelect,
}: CardTypeInterface) => {
  return (
    <div
      className={`card-type ${typeProdSelect?.id === item.id ? 'active' : ''} ${item?.disabled ? 'disabled' : ''}`}
    >
      <div
        className="card-type-div"
        onClick={() => {
          if (item.disabled) {
            Modal.info({
              title:
                'Este equipamento está em manutenção e ficará disponível em breve para locação.',
              okText: 'Ok',
            });
            return;
          }
          setTypeProdSelect(item);
        }}
      >
        <Image
          alt={item.name}
          className="card-type-img"
          placeholder={<Skeleton.Avatar shape="square" />}
          preview={false}
          src={item.photo}
        />
        <Typography className="card-type-title">{item.name}</Typography>
      </div>
    </div>
  );
};

export default CardType;
