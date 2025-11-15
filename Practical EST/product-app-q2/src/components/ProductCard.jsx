import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ProductCard(props) {
    props = props.details;
    if(!props.header) console.error("Missing Header");
    if(!props.desc) console.error("Missing Description");
    if(!props.size) console.error("Missing Size");
    if(!props.price) console.error("Missing Price");
    if(!props.img) console.error("Missing img url");
    if(!props.img["src"] || !props.img['alt']) console.error("Missing image attributes");

  return (
    <Card className='mt-5 ml-10' sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt={props.img.alt}
        height="140"
        image={props.img.src}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.header}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {props.desc}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">{props.price}</Button>
        <Button size="small">{props.size}</Button>
      </CardActions>
    </Card>
  );
}