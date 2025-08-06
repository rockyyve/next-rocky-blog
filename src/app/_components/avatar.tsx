type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="flex items-center">
      <img 
        src={picture} 
        className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-3" 
        alt={name} 
      />
      <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
        {name}
      </div>
    </div>
  );
};

export default Avatar;
