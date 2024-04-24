import { DateTime } from 'luxon';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Child } from '../child/child.entity';

@Entity()
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  size?: string;

  @ManyToOne(() => Child)
  child: Promise<Child>;

  @RelationId((meal: Meal) => meal.child)
  childId: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: DateTime) => value.toSQL(),
      from: (value: string) =>
        DateTime.fromSQL(value).toUTC().startOf('minute'),
    },
  })
  date: DateTime<true>;

  @CreateDateColumn({
    transformer: {
      to: (value?: DateTime) => value?.toJSDate(),
      from: (value: Date) => DateTime.fromJSDate(value).toUTC(),
    },
  })
  createdAt: DateTime;

  @UpdateDateColumn({
    transformer: {
      to: (value?: DateTime) => value?.toJSDate(),
      from: (value: Date) => DateTime.fromJSDate(value).toUTC(),
    },
  })
  updatedAt: DateTime;
}
